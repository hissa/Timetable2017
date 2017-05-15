<?php
class Period{
    protected $Subject;
    protected $EventType;
    protected $Text;

    function __construct($subject, $eventType, $text = null){
        $this->Subject = $subject;
        $this->Text = $text;
        if(!($eventType === "none" || $eventType === "watch" || $eventType === "report")){
            throw new Exception("eventの値が不正です。");
        }
        $this->EventType = $eventType;
    }

    public static function parseArray($array){
        $subject = $array["subject_id"];
        $eventEvent = $array["event_type"];
        $text = $array["text"];
        return new static($subject, $eventType, $text);
    }
}