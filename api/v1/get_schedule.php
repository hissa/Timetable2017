<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";
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
$shortName = isset($_GET["short_name"]) ? (bool)$_GET["short_name"] : false;
echo Timetable::GetSchedulesAllDataJson();