<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";
require_once dirname(__FILE__)."/../../server/Event.php";
require_once dirname(__FILE__)."/../../server/User.php";
require_once dirname(__FILE__)."/../../server/Carbon/Carbon.php";
use Carbon\Carbon;
$date = Carbon::parse($_GET["date"]);
echo Timetable::GetEventListJson($date, $date);

