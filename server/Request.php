<?php
class Request{
    protected $StartDate;
    protected $EndDate;

    function __construct($startDate, $endDate){
        $this->StartDate = $startDate;
        $this->endDate = $endDate;
    }
}