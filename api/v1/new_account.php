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
    echo json_encode($data, JSON_UNESACAPED_UNICODE);
    die();
}
User::createNewAccount($id, $password, $name);
$data["status"] = "success";
echo json_encode($data, JSON_UNESCAPED_UNICODE);
