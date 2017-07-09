<?php
require_once "../../server/User.php";
require_once "../../server/Carbon/Carbon.php";
// $inputId = $_POST["id"];
// $inputPassword = $_POST["password"];
// $enableAutoLogin =
    // isset($_POST["enable_auto_login"]) ? (bool)$_POST["enable_auto_login"] : false;
//debug
$inputId = $_GET["id"];
$inputPassword = $_GET["password"];
$enableAutoLogin =
    isset($_GET["enable_auto_login"]) ? (bool)$_GET["enable_auto_login"] : false;

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

// debug
// $inputId = "hissa_tester";
// $inputPassword = "test";
// $usr = new User($inputId);
// var_dump($usr->getAutoLoginKeys());
// $accessId = "7";
// $accessKey = "$2y$10$2k/.AqwYV87vnaOSJGH1Q.tKggWQ7mcrhLjZ/jK50KHPN9Au4JAEC";
// $user = new User($inputId);
// $user->access($accessId, $accessKey);
// var_dump($user);
// User::writeLoginLog("tester", 0);  
// $id = "5962598db4a53";
// $key = '$2y$10$BKrnwPdi.f9XIGH0mF4baOTj.Hh4DZd9mo2/oa18UY3k9zyrJsURK';
// $usr = User::getUserFromAutoLoginId($id);
// $usr->autoLogin($id, $key);
// var_dump($usr);

// Login (Return: AccessKey, AutoLoginKey)
// Use transaction
