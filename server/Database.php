<?php
class Database{
    protected static $configFileName;
    protected static $host;
    protected static $username;
    protected static $password;
    protected static $dbname;
    protected static $dsn;

    protected static function initialize(){
        static::loadConfig($configFileName);
        static::$dsn
            = "mysql:dbname=".static::$dbname.";host=".static::$host.";charset=utf8";
    }

    protected static function loadConfig($filename){
        $configStr = file_get_contents($filename);
        $config = json_decode($configStr, true);
        $dbconfig = $config["database"];
        static::$host = $dbconfig["host"];
        static::$username = $dbconfig["username"];
        static::$password = $dbconfig["password"];
        static::$dbname = $dbconfig["dbname"];
    }

    public static function getPdoObject(){
        if(!static::$dsn){
            static::initialize();
        }
        $pdo = new PDO($dsn, $username, $password);
    }
}