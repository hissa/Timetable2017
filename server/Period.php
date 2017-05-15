<?php
class Period{
    protected $Subject;
    protected $Event;
    protected $Text;

    function __construct($subject, $event, $text = null){
        $this->Subject = $subject;
        $this->Text = $text;
        if(!($event === "none" || $event === "watch" || $event === "report")){
            throw new Exception("eventの値が不正です。");
        }
        $this->Event = $event;
    }

    public static function parseArray($array){
        $subject = $array["subject_id"];
        $event = $array["event_type"];
        $text = $array["text"];
        return new static($subject, $event, $text);
    }
}