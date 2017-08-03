<?php
require_once "../../server/Timetable.php";
require_once "../../server/Event.php";
require_once "../../server/Carbon/Carbon.php";
require_once "../../server/Subject.php";
require_once "../../server/Database.php";
require_once "../../server/User.php";
use Carbon\Carbon;
$data = [];
if(!(isset($_POST["access_id"]) && isset($_POST["access_key"]))){
    $data["status"] = "error";
    $data["error_info"] = "ログインが必要です。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
if(!User::isExistsAccessId($_POST["access_id"])){
    $data["status"] = "error";
    $data["error_info"] = "IDが存在しません。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
if(!User::canAccess($_POST["access_id"], $_POST["access_key"])){
    $data["status"] = "error";
    $data["error_info"] = "ログインに失敗しました。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
$user = User::access($_POST["access_id"], $_POST["access_key"]);
$data["status"] = "success";
$data["user_id"] = $user->id;
$data["user_name"] = $user->displayName;
echo json_encode($data, JSON_UNESCAPED_UNICODE);