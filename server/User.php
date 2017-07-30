<?php
error_reporting(E_ALL);
require_once "Database.php";
use Carbon\Carbon;
class User{
    public $id;
    public $displayName;
    public $loggedIn = false;
    public $accessId;
    public $hashedAccessKey;

    public function __construct($id){
        if(!static::isExistsId($id)){
            throw new Exception("IDが存在しません。");
        }
        $this->id = $id;
        $this->fetchInfos();
    }

    public function fetchInfos(){
        $pdo = Database::getPdoObject();
        $sql = "select * from users where id=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$this->id]);
        $result = $stmt->fetchAll();
        $this->displayName = $result[0]["id"];
    }

    public function login($password){
        if(!$this->canLogin($password)){
            throw new Exception("パスワードが間違っています。");
        }
        $this->loggedIn = true;
        $this->makeAccessKey();
    }

    protected function forcedLogin(){
        $this->loggedIn = true;
        $this->makeAccessKey();
    }

    public function access($accessId, $hashedAccessKey){
        if(!$this->canAccess($accessId, $hashedAccessKey)){
            throw new Exception("AccessKeyが間違っています。");
        }
        $this->loggedIn = true;
    }

    public function canAccess($accessId, $hashedAccessKey){
        if(!static::isExistsAccessId($accessId)){
            throw new Exception("AccessIdが存在しません。");
        }
        $pdo = Database::getPdoObject();
        $sql = "select * from access_keys where access_id=? and expiration>=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$accessId, Carbon::now("Asia/Tokyo")]);
        $result = $stmt->fetchAll();
        $keyCorrect = password_verify($result[0]["access_key"], $hashedAccessKey);
        $idCorrect = $this->id == $result[0]["user_id"];
        return $keyCorrect && $idCorrect;
    }

    public static function isExistsAccessId($accessId){
        // TODO: IDが存在した場合は返り値でそのレコードの情報を返したほうが
        //       canAccess()で再びDBにアクセスすることがなくなるのでそっちのほうがいいかも
        $pdo = Database::getPdoObject();
        $sql = "select access_id from access_keys where access_id=? and expiration>=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$accessId, Carbon::now("Asia/Tokyo")]);
        $result = $stmt->fetchAll();
        return isset($result[0][0]);
    }

    protected function makeAccessKey(){
        $uniqId = uniqid();
        $expiration = Carbon::now("Asia/Tokyo")->addDay();
        $pdo = Database::getPdoObject();
        $sql = "insert into access_keys(access_key, user_id, expiration) values(?, ?, ?);";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$uniqId, $this->id, $expiration]);
        $accessId = (int)$pdo->lastInsertId();
        $hashedAccessKey = password_hash($uniqId, PASSWORD_DEFAULT);
        $this->accessId = $accessId;
        $this->hashedAccessKey = $hashedAccessKey;
    }

    public static function isExistsId($id){
        $pdo = Database::getPdoObject();
        $sql = "select id from users where id=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $result = $stmt->fetchAll();
        return isset($result[0]);
    }

    public function canLogin($password){
        $pdo = Database::getPdoObject();
        $sql = "select hashed_password from users where id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$this->id]);
        $result = $stmt->fetchAll();
        $hashedPassword = $result[0][0];
        $canLogin = password_verify($password, $hashedPassword);
        return $canLogin;
    }

    public function getAutoLoginKeys(){
        if(!$this->loggedIn){
            throw new Exception("ログインしてください。");
        }
        $autoLoginId = uniqid();
        $autoLoginKey = password_hash(uniqid(), PASSWORD_DEFAULT);
        $expiration = Carbon::now("Asia/Tokyo")->addMonth();
        $pdo = Database::getPdoObject();
        $sql = "insert into auto_login_keys(auto_login_id, auto_login_key, user_id, expiration)".
            " values(?,?,?,?);";
        $stmt = $pdo->prepare($sql);
        $r = $stmt->execute([$autoLoginId, $autoLoginKey, $this->id, $expiration]);
        return [
            "autoLoginId" => $autoLoginId,
            "hashedAutoLoginKey" => password_hash($autoLoginKey, PASSWORD_DEFAULT)
        ];
    }

    public function autoLogin($autoLoginId, $hashedKey){
        if(!$this->canAutoLogin($autoLoginId, $hashedKey)){
            throw new Exception("AutoLoginKeyが間違っています。");
        }
        $this->forcedLogin();
        return $this->changeAutoLoginKey($autoLoginId);   
    }

    public function changeAutoLoginKey($autoLoginId){
        if(is_null(static::getUserFromAutoLoginId($autoLoginId))){
            throw new Exception("存在しないAutoLoginIdです。");
        }
        $newKey = password_hash(uniqid(), PASSWORD_DEFAULT);
        $pdo = Database::getPdoObject();
        $sql = "update auto_login_keys set auto_login_key=? where auto_login_id=?,expiration=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$newKey, $autoLoginId, Carbon::now("Asia/Tokyo")->addMonth()]);
        return password_hash($newKey, PASSWORD_DEFAULT);
    }

    public function canAutoLogin($autoLoginId, $hashedKey){
        $pdo = Database::getPdoObject();
        $sql = "select auto_login_key from auto_login_keys where auto_login_id=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$autoLoginId]);
        $key = $stmt->fetchAll()[0][0];
        return password_verify($key, $hashedKey);
    }

    public static function getUserFromAutoLoginId($autoLoginId){
        $pdo = Database::getPdoObject();
        $sql = "select user_id from auto_login_keys where auto_login_id=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$autoLoginId]);
        $result = $stmt->fetchAll();
        return isset($result[0][0]) ? new static($result[0][0]) : null;
    }

    public static function createNewAccount($id, $password, $name){
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $pdo = Database::getPdoObject();
        $sql = "insert into users(id, name, hashed_password) ".
                "values(?, ?, ?);";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id, $name, $hashedPassword]);
        return true;
    }

    public static function writeLoginLog($userId, $accessId, $success = true){
        $pdo = Database::getPdoObject();
        $sql = "insert into user_login_log(user_id, access_id, date_time, success) ".
                "values(?, ?, ?, ?);";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $accessId, Carbon::now("Asia/Tokyo"), $success]);
    }
}