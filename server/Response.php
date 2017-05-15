<?php
class Response{
    protected $Days;

    function __construct($days){
        $this->Days += $days;
    }
}