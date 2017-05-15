<?php
class Period{
    public $Subject;
    public $EventType;
    public $Text;

    function __construct($subject, $eventType, $text = null){
        $this->Subject = new Subject((int)$subject);
        $this->Text = $text;
        if(!($eventType === "none" || $eventType === "watch" || $eventType === "report")){
            throw new Exception("eventの値が不正です。");
        }
        $this->EventType = $eventType;
    }
}