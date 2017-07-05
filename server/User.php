<?php
require_once "Database.php";
class User{
    public $id;
    public $displayName;
    public $loggedIn = false;

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