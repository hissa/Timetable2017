<?php
class Timetable{
    protected static $WeeksCount = 5;
    protected static $ClassesCount = 3;

    public static function GetSchedules(){
        $pdo = Database::getPdoObject();
        $sql = "select * from schedules;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([]);
        $result = $stmt->fetchAll();
        $schedules = [[]];
        $i = 0;
        while(isset($result[$i])){
            $schedules[$result[$i]["week_num"]][$result[$i]["period_num"]] =
                new Subject($result[$i]["subject_id"]);
            $i++;
        }
        return $schedules;
    }

    public function AddEvent(){

    }

    public function RemoveEvent(){

    }

    public function GetEventList(){

    }
}