<?php
use Carbon\Carbon;
class Timetable{
    protected static $WeeksCount = 5;
    protected static $ClassesCount = 3;

    public static function GetSchedulesString($shortName = false){
        $schedules = Subject::GetSchedules();
        $schedulesStr;
        $week = 0;
        while(isset($schedules[$week])){
            $period = 0;
            while(isset($schedules[$week][$period])){
                $schedulesStr[$week][$period] = 
                    $shortName ?
                    $schedules[$week][$period]->ShortName:
                    $schedules[$week][$period]->Name;
                $period++;
            }
            $week++;
        }
        return $schedulesStr;
    }

    public static function GetSchedulesJson($shortName = false){
        $schedulesStr = static::GetSchedulesString($shortName);
        $json = json_encode($schedulesStr, JSON_UNESCAPED_UNICODE);
        return $json;
    }

    public static function GetSchedulesAllData(){
        $schedules = Subject::GetSchedules();
        $schedulesAry;
        $week = 0;
        while(isset($schedules[$week])){
            $period = 0;
            while(isset($schedules[$week][$period])){
                $current = $schedules[$week][$period];
                $schedulesAry[$week][$period] = $current->ToArray();
                $period++;
            }
            $week++;
        }
        return $schedulesAry;
    }
    
    public static function GetSchedulesAllDataJson(){
        $schedule = static::GetSchedulesAllData();
        return json_encode($schedule, JSON_UNESCAPED_UNICODE);
    }

    public function AddEvent(){

    }

    public function RemoveEvent(){

    }

    public static function GetEventListString($start, $end){
        $events = Event::fetchEventsFromPeriod($start, $end);
        $eventsStr = [];
        $i = 0;
        while(isset($events[$i])){
            $current = $events[$i];
            array_push($eventsStr, $current->ToArray());
            $i++;
        }
        return $eventsStr;
    }

    public static function GetEventListJson($start, $end){
        $events = static::GetEventListString($start, $end);
        $json = json_encode($events, JSON_UNESCAPED_UNICODE);
        return $json;
    }

    public static function SubmitNewEvent($date, $subjectId, $eventType, $text){
        $newEvent = new Event(null, Carbon::parse($date), new Subject($subjectId), $eventType, $text);
        $newEvent->AddToDatabase();
    }
}