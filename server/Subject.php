<?php
class Subject{
    public $SubjectId;
    public $SubjectName;
    public $SubjectShortName;

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
                var_dump($found);
                break;
            }
            $i++;
        }
        if($found < 0){
            throw new Exception("SubjectIdが存在しない可能性があります。");
        }
        $this->SubjectId = static::$SubjectsTable[$found]["id"];
        $this->SubjectName = static::$SubjectsTable[$found]["name"];
        $this->SubjectShortName = static::$SubjectsTable[$found]["short_name"];
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
}