<?php
require_once "../../server/User.php";
require_once "../../server/Carbon/Carbon.php";

$data = [];
$autoLoginId = $_POST["auto_login_id"];
$autoLoginKey = $_POST["auto_login_key"];
$user = User::getUserFromAutoLoginId($autoLoginId);
if(is_null($user)){
    $data["status"] = "error";
    $data["error_info"] = "AutoLoginIdが存在しません。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
if(!$user->canAutoLogin($autoLoginId, $autoLoginKey)){
    $data["status"] = "error";
    $data["error_info"] = "AutoLoginKeyが誤っています。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
$newKey = $user->autoLogin($autoLoginId, $autoLoginKey);
if(!$user->loggedIn){
    $data["status"] = "error";
    $data["error_info"] = "不明なエラーです。";
}
$data["status"] = "success";
$data["access_id"] = $user->accessId;
$data["access_key"] = $user->hashedAccessKey;
$data["new_auto_login_key"] = $newKey;
echo json_encode($data, JSON_UNESCAPED_UNICODE);
// debug
// $autoLoginId = $_GET["auto_login_id"];
// $autoLoginKey = $_GET["auto_login_key"];
// $user = User::getUserFromAutoLoginId($autoLoginId);
// $newKey = $user->autoLogin($autoLoginId, $autoLoginKey);
// var_dump($newKey);