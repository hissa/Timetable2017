<?php
require_once "../../server/Timetable.php";
require_once "../../server/Event.php";
require_once "../../server/Carbon/Carbon.php";
require_once "../../server/Subject.php";
require_once "../../server/Database.php";
use Carbon\Carbon;

$date = $_POST["date"];
$subjectId = $_POST["subject_id"];
$eventType = $_POST["event_type"];
$text = isset($_POST["text"]) ? $_POST["text"] : null;
Timetable::SubmitNewEvent($date, $subjectId, $eventType, $text);
echo "success";