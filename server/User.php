<?php
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

    private function makeAccessKey(){
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
}