<?php
class Day{
    public $Date;
    public $Periods = [];

    function __construct($date, $periods){
        if(gettype($date) === "string"){
            $date = Carbon::parse($date);
        }
        $this->Date = $date;
        $this->Periods += $periods;
    }

    public function addPeriod($period){
        $this->Periods += $period;
    }

    public static function parseArray($array){
        $obj = new static($array[0]["date"], []);
        $i = 0;
        while($array[$i]){
            if(!Carbon::parse($array[$i]["date"])->eq($this->Date)){
                throw new Exception("配列の中の全ての日付が同一でなければなりません。");
            }
            $newPeriod = Period::parseArray($array[$i]);
            $obj->addPeriod($newPeriod);
            $i++;
        }
        return $obj;
    }
}