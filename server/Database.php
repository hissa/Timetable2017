<?php
class Database{
    protected static $ConfigFileName;
    protected static $Host;
    protected static $Username;
    protected static $Password;
    protected static $Dbname;
    protected static $Dsn;

    protected static function initialize(){
        static::$ConfigFileName = dirname(__FILE__)."/config.json";
        static::loadConfig(static::$ConfigFileName);
        static::$Dsn
            = "mysql:dbname=".static::$Dbname.";host=".static::$Host.";charset=utf8";
    }

    protected static function loadConfig($filename){
        $configStr = file_get_contents($filename);
        $config = json_decode($configStr, true);
        $dbconfig = $config["database"];
        static::$Host = $dbconfig["host"];
        static::$Username = $dbconfig["username"];
        static::$Password = $dbconfig["password"];
        static::$Dbname = $dbconfig["dbname"];
    }

    public static function getPdoObject(){
        if(!static::$Dsn){
            static::initialize();
        }
        try{
            $pdo = new PDO(static::$Dsn, static::$Username, static::$Password);
        }catch(Exception $e){
            throw new Exception("データベースへの接続に失敗しました。");
        }
        return $pdo;
    }
}