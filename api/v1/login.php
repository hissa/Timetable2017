<?php
require_once "../../server/User.php";
require_once "../../server/Carbon/Carbon.php";
if(isset($_POST["id"])){
    $inputId = $_POST["id"];
    $inputPassword = $_POST["password"];
    $enableAutoLogin =
        isset($_POST["enable_auto_login"]) ? (bool)$_POST["enable_auto_login"] : false;
}else{
    //POSTに入力がなければGETを見る
    $inputId = $_GET["id"];
    $inputPassword = $_GET["password"];
    $enableAutoLogin =
        isset($_GET["enable_auto_login"]) ? (bool)$_GET["enable_auto_login"] : false;
}

$data = [];
if(!User::isExistsId($inputId)){
    $data["status"] = "error";
    $data["error_info"] = "IDが存在しません。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
$user = new User($inputId);
if(!$user->canLogin($inputPassword)){
    $data["status"] = "error";
    $data["error_info"] = "パスワードが間違っています。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
$user->login($inputPassword);
if(!$user->loggedIn){
    $data["status"] = "error";
    $data["error_info"] = "不明なエラーです。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
$data["status"] = "success";
$data["access_id"] = $user->accessId;
$data["access_key"] = $user->hashedAccessKey;
if($enableAutoLogin){
    $keys = $user->getAutoLoginKeys();
    $data["auto_login_id"] = $keys["autoLoginId"];
    $data["auto_login_key"] = $keys["hashedAutoLoginKey"];
}
echo json_encode($data, JSON_UNESCAPED_UNICODE);