<?php
require_once "../../server/User.php";
require_once "../../server/Carbon/Carbon.php";
// $inputId = $_POST["id"];
// $inputPassword = $_POST["password"];
// debug
$inputId = "hissa_tester";
$inputPassword = "test";
// var_dump(User::canLogin($inputId, $inputPassword));
// $user = new User($inputId);
// $user->login($inputPassword);
// var_dump($user);
$accessId = "8";
$accessKey = "$2y$10$2k/.AqwYV87vnaOSJGH1Q.tKggWQ7mcrhLjZ/jK50KHPN9Au4JAEC";
$user = new User($inputId);
$user->access($accessId, $accessKey);
var_dump($user);


// Login (Return: AccessKey, AutoLoginKey)
// Use transaction