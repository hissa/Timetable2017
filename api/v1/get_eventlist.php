<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";
require_once dirname(__FILE__)."/../../server/Event.php";
require_once dirname(__FILE__)."/../../server/Carbon/Carbon.php";
use Carbon\Carbon;

$start = Carbon::parse("2017-04-17");
$end = Carbon::parse("2017-04-17");

// var_dump(Event::fetchEventsFromPeriod($start, $end));
echo Timetable::GetEventListJson($start, $end);