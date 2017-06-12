<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";

$shortName = isset($_GET["short_name"]) ? (bool)$_GET["short_name"] : false;
// echo Timetable::GetSchedulesJson($shortName);
echo Timetable::GetSchedulesAllDataJson();