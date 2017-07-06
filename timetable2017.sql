-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 2017 年 7 朁E06 日 22:14
-- サーバのバージョン： 10.1.21-MariaDB
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `timetable2017`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `access_keys`
--

CREATE TABLE `access_keys` (
  `access_id` int(11) NOT NULL,
  `access_key` text COLLATE utf8_unicode_ci NOT NULL,
  `user_id` text COLLATE utf8_unicode_ci NOT NULL,
  `expiration` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `access_keys`
--

INSERT INTO `access_keys` (`access_id`, `access_key`, `user_id`, `expiration`) VALUES
(7, '595d2c95ab6af', 'hissa_tester', '2017-07-07 03:14:45');

-- --------------------------------------------------------

--
-- テーブルの構造 `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `subject_id` int(11) NOT NULL,
  `event_type` enum('report','watch','other','none','') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'none',
  `text` text COLLATE utf8_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `events`
--

INSERT INTO `events` (`id`, `date`, `subject_id`, `event_type`, `text`) VALUES
(1, '2017-04-17', 1, 'report', NULL),
(2, '2017-04-17', 2, 'watch', NULL),
(3, '2017-06-19', 1, 'watch', NULL),
(6, '2017-06-19', 2, 'report', ''),
(7, '2017-07-03', 1, 'report', ''),
(8, '2017-07-03', 2, 'watch', ''),
(9, '2017-07-04', 4, 'watch', 'hoge'),
(10, '2017-07-05', 2, 'other', ''),
(11, '2017-07-04', 1, 'watch', 'foo'),
(12, '2017-07-06', 7, 'watch', '');

-- --------------------------------------------------------

--
-- テーブルの構造 `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `week_num` int(11) NOT NULL,
  `period_num` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `schedules`
--

INSERT INTO `schedules` (`id`, `week_num`, `period_num`, `subject_id`) VALUES
(1, 0, 0, 1),
(2, 0, 1, 2),
(3, 0, 2, 3),
(4, 1, 0, 4),
(5, 1, 1, 1),
(6, 1, 2, 2),
(7, 2, 0, 3),
(8, 2, 1, 2),
(9, 2, 2, 6),
(10, 3, 0, 2),
(11, 3, 1, 7),
(12, 3, 2, 5),
(13, 4, 0, 8),
(14, 4, 1, 9),
(15, 4, 2, 3);

-- --------------------------------------------------------

--
-- テーブルの構造 `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  `short_name` text COLLATE utf8_unicode_ci NOT NULL,
  `grade` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `short_name`, `grade`) VALUES
(1, '日本史B', '日本史', 3),
(2, 'ビジネス実務', 'ビジネス', 3),
(3, '古典B', '古典', 3),
(4, '社会と情報', '情報', 3),
(5, '化学基礎', '化学', 3),
(6, '体育Ⅲ', '体育', 3),
(7, '英語表現Ⅰ', '英語', 3),
(8, 'ドリームクラフトⅢ', 'ドリクラ', 3),
(9, '家庭基礎', '家庭', 3);

-- --------------------------------------------------------

--
-- テーブルの構造 `test`
--

CREATE TABLE `test` (
  `id` int(11) NOT NULL,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  `age` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `test`
--

INSERT INTO `test` (`id`, `name`, `age`) VALUES
(1, 'Hissa', 10),
(3, 'link', 18);

-- --------------------------------------------------------

--
-- テーブルの構造 `users`
--

CREATE TABLE `users` (
  `id` text COLLATE utf8_unicode_ci NOT NULL,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  `hashed_password` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `users`
--

INSERT INTO `users` (`id`, `name`, `hashed_password`) VALUES
('hissa_tester', 'テスターひっさ', '$2y$10$7fPom4EVjvQ1toYdktp6DenEqRpwGz3KtEVJ6fQ2/1zecNrjtgDmG');

-- --------------------------------------------------------

--
-- テーブルの構造 `user_login_log`
--

CREATE TABLE `user_login_log` (
  `id` int(11) NOT NULL,
  `user_id` text COLLATE utf8_unicode_ci NOT NULL,
  `access_id` int(11) NOT NULL,
  `date_time` datetime NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- テーブルのデータのダンプ `user_login_log`
--

INSERT INTO `user_login_log` (`id`, `user_id`, `access_id`, `date_time`, `success`) VALUES
(1, 'hissa_tester', 7, '2017-07-06 03:50:47', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_keys`
--
ALTER TABLE `access_keys`
  ADD PRIMARY KEY (`access_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `test`
--
ALTER TABLE `test`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`(30));

--
-- Indexes for table `user_login_log`
--
ALTER TABLE `user_login_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_keys`
--
ALTER TABLE `access_keys`
  MODIFY `access_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `test`
--
ALTER TABLE `test`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `user_login_log`
--
ALTER TABLE `user_login_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
