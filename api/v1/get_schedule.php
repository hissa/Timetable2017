<?php
require_once dirname(__FILE__)."/../../server/Timetable.php";
require_once dirname(__FILE__)."/../../server/Database.php";
require_once dirname(__FILE__)."/../../server/Subject.php";
$schedules = Timetable::GetSchedules();
$schedulesStr;
$week = 0;
while(isset($schedules[$week])){
    $period = 0;
    while(isset($schedules[$week][$period])){
        $schedulesStr[$week][$period] = 
            $schedules[$week][$period]->SubjectName;
        $period++;
    }
    $week++;
}
$json = json_encode($schedulesStr, JSON_UNESCAPED_UNICODE);
echo $json;