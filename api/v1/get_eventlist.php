<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";
require_once dirname(__FILE__)."/../../server/Event.php";
require_once dirname(__FILE__)."/../../server/User.php";
require_once dirname(__FILE__)."/../../server/Carbon/Carbon.php";
use Carbon\Carbon;
if(!(isset($_GET["access_id"]) && isset($_GET["access_key"]))){
    echo "ログインしてください。";
    die();
}
if(!User::isExistsAccessId($_GET["access_id"])){
    echo "IDが存在しません。";
    die();
}
if(!User::canAccess($_GET["access_id"], $_GET["access_key"])){
    echo "ログインできませんでした。";
    die();
}

$start = Carbon::parse($_GET["start"]);
$end = Carbon::parse($_GET["end"]);
echo Timetable::GetEventListJson($start, $end);