<?php
require_once "../../server/User.php";
require_once "../../server/Carbon/Carbon.php";

// debug
$autoLoginId = $_GET["auto_login_id"];
$autoLoginKey = $_GET["auto_login_key"];
$user = User::getUserFromAutoLoginId($autoLoginId);
$newKey = $user->autoLogin($autoLoginId, $autoLoginKey);
var_dump($newKey);