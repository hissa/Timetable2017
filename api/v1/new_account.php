<?php
require_once "../../server/User.php";
require_once "../../server/Carbon/Carbon.php";
if(isset($_POST["id"])){
    $id = $_POST["id"];
    $password = $_POST["password"];
    $name = $_POST["name"];
}else{
    // POSTに入力がない場合はGETを見る
    $id = $_GET["id"];
    $password = $_GET["password"];
    $name = $_GET["name"];
}
$data = [];
if(User::isExistsId($id)){
    $data["status"] = "error";
    $data["error_info"] = "既に存在するIDです。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
// idが3文字未満の場合はエラー
if(mb_strlen($id) < 3){
    $data["status"] = "error";
    $data["error_info"] = "IDは3文字以上にしてください。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
// 表示名が0文字の場合はエラー
if(mb_strlen($name) <= 0){
    $data["status"] = "error";
    $data["error_info"] = "表示名を指定してください。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
// パスワードが6文字未満の場合はエラー
if(mb_strlen($password) < 6){
    $data["status"] = "error";
    $data["error_info"] = "パスワードは6文字以上に設定してください。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
User::createNewAccount($id, $password, $name);
$data["status"] = "success";
echo json_encode($data, JSON_UNESCAPED_UNICODE);
