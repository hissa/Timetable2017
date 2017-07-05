<?php
require_once "../../server/User.php";
// $inputId = $_POST["id"];
// $inputPassword = $_POST["password"];
// debug
$inputId = "hissa_tester";
$inputPassword = "test";
// var_dump(User::canLogin($inputId, $inputPassword));
$user = new User($inputId);
$user->login($inputPassword);
var_dump($user);


// Login (Return: AccessKey, AutoLoginKey)
// Use transaction