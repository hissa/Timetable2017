<?php
require_once "Database.php";
require_once "Response.php";
require_once "Day.php";
require_once "Period.php";
require_once "./Carbon/Carbon.php";
use Carbon\Carbon;

class Request{
    protected $StartDate;
    protected $EndDate;
    protected $Response;

    function __construct($startDate, $endDate){
        if(gettype($startDate) === "string"){
            $startDate = Carbon::parse($startDate);
        }
        if(gettype($endDate) === "string"){
            $endDate = Carbon::parse($endDate);
        }
        $this->StartDate = $startDate;
        $this->EndDate = $endDate;
    }

    public function fetchEvents(){
        $pdo = Database::getPdoObject();
        $sql = "select * from events where date >= ? and date <= ?;";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$this->StartDate->format("Y-m-d"), $this->EndDate->format("Y-m-d")]);
        // var_dump($stmt->fetchAll());
        $result = $stmt->fetchAll();
        $this->makeResponse($result);
    }

    private function makeResponse($data){
        $currentDate = $this->StartDate;
        while($currentDate->lte($this->EndDate)){
            $periods = [];
            $i = 0;
            while(isset($data[$i])){
                $thisDate = Carbon::parse($data[$i]["date"]);
                if($currentDate->eq($thisDate)){
                    $periods += [Period::parseArray($data[$i])];
                }
                var_dump($periods);
                $i++;
            }
            $currentDate = $currentDate->addDay();
        }
    }
}