<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";
require_once dirname(__FILE__)."/../../server/Event.php";
require_once dirname(__FILE__)."/../../server/Carbon/Carbon.php";
use Carbon\Carbon;

$start = Carbon::parse($_GET["start"]);
$end = Carbon::parse($_GET["end"]);
echo Timetable::GetEventListJson($start, $end);