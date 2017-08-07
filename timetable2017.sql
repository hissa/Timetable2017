-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 2017 年 8 朁E07 日 18:45
-- サーバのバージョン： 10.1.21-MariaDB
-- PHP Version: 7.1.1


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

-- --------------------------------------------------------

--
-- テーブルの構造 `action_logs`
--

CREATE TABLE `action_logs` (
  `id` int(11) NOT NULL,
  `user_id` text COLLATE utf8_unicode_ci NOT NULL,
  `action_type` enum('add') COLLATE utf8_unicode_ci NOT NULL,
  `date_time` datetime NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- テーブルの構造 `auto_login_keys`
--

CREATE TABLE `auto_login_keys` (
  `id` int(11) NOT NULL,
  `auto_login_id` text COLLATE utf8_unicode_ci NOT NULL,
  `auto_login_key` text COLLATE utf8_unicode_ci NOT NULL,
  `user_id` text COLLATE utf8_unicode_ci NOT NULL,
  `expiration` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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

-- --------------------------------------------------------

--
-- テーブルの構造 `invite_codes`
--

CREATE TABLE `invite_codes` (
  `id` int(11) NOT NULL,
  `code` text COLLATE utf8_unicode_ci NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `used_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
-- テーブルの構造 `users`
--

CREATE TABLE `users` (
  `id` text COLLATE utf8_unicode_ci NOT NULL,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  `hashed_password` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
-- Indexes for dumped tables
--

--
-- Indexes for table `access_keys`
--
ALTER TABLE `access_keys`
  ADD PRIMARY KEY (`access_id`);

--
-- Indexes for table `action_logs`
--
ALTER TABLE `action_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `auto_login_keys`
--
ALTER TABLE `auto_login_keys`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invite_codes`
--
ALTER TABLE `invite_codes`
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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`(30));

--
-- Indexes for table `user_login_log`
--
ALTER TABLE `user_login_log`
  ADD PRIMARY KEY (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
