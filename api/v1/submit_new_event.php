<?php
require_once "../../server/Timetable.php";
require_once "../../server/Event.php";
require_once "../../server/Carbon/Carbon.php";
require_once "../../server/Subject.php";
require_once "../../server/Database.php";
require_once "../../server/User.php";
use Carbon\Carbon;
if(!(isset($_POST["access_id"]) && isset($_POST["access_key"]))){
    echo "ログインしてください。";
    die();
}
if(!User::isExistsAccessId($_POST["access_id"])){
    echo "IDが存在しません。";
    die();
}
if(!User::canAccess($_POST["access_id"], $_POST["access_key"])){
    echo "ログインできませんでした。";
    die();
}
$user = User::access($_POST["access_id"], $_POST["access_key"]);

$date = $_POST["date"];
$subjectId = $_POST["subject_id"];
$eventType = $_POST["event_type"];
$text = isset($_POST["text"]) ? $_POST["text"] : null;
$insertedId = Timetable::SubmitNewEvent($date, $subjectId, $eventType, $text);
Event::writeActionLog($insertedId, $user->id);
echo "success";