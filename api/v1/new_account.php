<?php
require_once "../../server/User.php";
require_once "../../server/Database.php";
require_once "../../server/Carbon/Carbon.php";
use Carbon\Carbon;
if(isset($_POST["id"])){
    $id = $_POST["id"];
    $password = $_POST["password"];
    $name = $_POST["name"];
    $inviteKey = $_POST["invite_key"];
}else{
    // POSTに入力がない場合はGETを見る
    $id = $_GET["id"];
    $password = $_GET["password"];
    $name = $_GET["name"];
    $inviteKey = $_GET["invite_key"];
}
function canUseInviteKey($inviteKey){
    $pdo = Database::getPdoObject();
    $sql = "select code from invite_codes where code=? and used=0;";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$inviteKey]);
    $result = $stmt->fetchAll();
    return isset($result[0][0]);
}
function useInviteKey($inviteKey, $pdo = null){
    $pdo = is_null($pdo) ? Database::getPdoObject() : $pdo;
    if(!canUseInviteKey($inviteKey)){
        throw new Exception("招待コードが無効です。");
    }
    $pdo = Database::getPdoObject();
    $sql = "update invite_codes set used=true, used_datetime=? where code=?;";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([Carbon::now("Asia/Tokyo"), $inviteKey]);
    return;
}
$data = [];
// 招待コードが無効な場合はエラー
if(!canUseInviteKey($inviteKey)){
    $data["status"] = "error";
    $data["error_info"] = "招待コードが無効です。";
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    die();
}
// IDが既に存在する場合はエラー
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
$pdo = Database::getPdoObject();
$pdo->beginTransaction();
UseInviteKey($inviteKey, $pdo);
User::createNewAccount($id, $password, $name, $pdo);
$pdo->commit();
$data["status"] = "success";
echo json_encode($data, JSON_UNESCAPED_UNICODE);
