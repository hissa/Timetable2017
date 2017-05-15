<?php
ini_set("display_errors", 1);
// require "Request.php";
// var_dump($_GET);
// $request = new Request($_GET["startDate"], $_GET["endDate"]);

// $dsn = "mysql:dbname=timetable2017;host=localhost;charset=utf8";
// $username = "root";
// $password = "";
// $pdo = new PDO($dsn, $username, $password);

// $name = "link";
// // $age = 18;
// $query = "select * from test where name=?;";
// $stmt = $pdo->prepare($query);
// $stmt->execute([$name]);
// $stmt->execute(["hissa"]);
// var_dump($stmt->fetchAll());
// $stmt = $pdo->query($query);
// $result = $stmt->fetchAll();
// var_dump($result);
// var_dump(json_encode($result));

require_once "Request.php";
$rq = new Request("2017-04-17", "2017-04-21");
$rs = $rq->fetchEvents();