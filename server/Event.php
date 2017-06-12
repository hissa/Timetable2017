<?php
use Carbon\Carbon;

class Event{
    public $Id;
    public $Date;
    public $Subject;
    public $EventType;
    public $Text;

    public function __construct($id, $date, $subject, $eventType, $text = null){
        $this->Id = (int)$id;
        $this->Date = gettype($date) == "object" ? 
            $date : Carbon::parse($date);
        $this->Subject = $subject;
        $this->EventType = $eventType;
        $this->Text = $text == "null" ? null : $text;
    }

    public static function fetchEvent($id){
        $pdo = Database::getPdoObject();
        $sql = "select * from events where id=?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $result = $stmt->fetchAll();
        $obj = new static(
            (int)$result[0]["id"],
            $result[0]["date"],
            new Subject($result[0]["subject_id"]),
            $result[0]["event_type"],
            $result[0]["text"]
        );
        return $obj;
    }

    public static function fetchEventsFromPeriod($start, $end){
        $start = gettype($start) == "object" ?
            $start : Carbon::parse($start);
        $end = gettype($end) == "object" ?
            $end : Carbon::parse($end);
        $pdo = Database::getPdoObject();
        $sql = "select * from events where date >= ? and date <= ?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$start->format("Y-m-d"), $end->format("Y-m-d")]);
        $result = $stmt->fetchAll();
        $events = [];
        $i = 0;
        while(isset($result[$i])){
            $current = $result[$i];
            $data = new static(
                $current["id"],
                $current["date"],
                new Subject($current["subject_id"]),
                $current["event_type"],
                $current["text"]
            );
            array_push($events, $data);
            $i++;
        }
        return $events;
    }
}