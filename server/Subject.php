<?php
class Subject{
    public $Id;
    public $Name;
    public $ShortName;

    protected static $SubjectsTable;


    function __construct($subjectId){
        // 初めてこれを利用する時にはデータベースから教科テーブルを読む
        if(static::$SubjectsTable == null){
            static::Initialize();
        }
        // 見つからなければfoundは-1のまま
        $i = 0;
        $found = -1;
        while(isset(static::$SubjectsTable[$i])){
            if(static::$SubjectsTable[$i]["id"] == $subjectId){
                $found = $i;
                break;
            }
            $i++;
        }
        if($found < 0){
            throw new Exception("SubjectIdが存在しない可能性があります。");
        }
        $this->Id = static::$SubjectsTable[$found]["id"];
        $this->Name = static::$SubjectsTable[$found]["name"];
        $this->ShortName = static::$SubjectsTable[$found]["short_name"];
    }

    protected static function Initialize(){
        $pdo = Database::getPdoObject();
        $sql = "select * from subjects;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll();
        $i = 0;
        $table = [];
        while(isset($result[$i])){
            $current = $result[$i];
            $table[$i] = [
                "id" => $current["id"],
                "name" => $current["name"],
                "short_name" => $current["short_name"],
                "grade" => $current["grade"]
            ];
            $i++;
        }
        static::$SubjectsTable = $table;
     }

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
                new static($result[$i]["subject_id"]);
            $i++;
        }
        return $schedules;
     }

     public function ToArray(){
         return [
             "id" => $this->Id,
             "name" => $this->Name,
             "short_name" => $this->ShortName
         ];
     }
}