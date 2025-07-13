-- 勤怠さんDB（フェーズ1）テーブル作成スクリプト

-- 既存テーブルを削除（外部キー制約のため逆順で削除）
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS temporary_users;
DROP TABLE IF EXISTS users;

-- 正規ユーザーテーブル
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    display_name VARCHAR(100),
    is_temporary BOOLEAN NOT NULL DEFAULT TRUE COMMENT '一時ユーザーかどうか',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 一時ユーザーテーブル（temporary_users）
CREATE TABLE temporary_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'この一時ユーザーに対応するusersテーブルID（is_temporary=TRUE）',
    identifier VARCHAR(255) UNIQUE NOT NULL COMMENT 'クッキー連携用一意識別子',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- グループテーブル
CREATE TABLE `groups` (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_code VARCHAR(7) NOT NULL DEFAULT '#3B82F6' COMMENT 'UIカラー',
    closing_day TINYINT NOT NULL DEFAULT 31 COMMENT '締め日(1-31)',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- グループメンバーテーブル
CREATE TABLE group_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role_type ENUM('admin','member') NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY unique_group_user (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 勤怠データテーブル
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    group_id BIGINT UNSIGNED NULL COMMENT '未所属の場合はNULL（個人利用）',
    clock_in DATETIME NOT NULL,
    clock_out DATETIME,
    memo TEXT,
    condition_code TINYINT NOT NULL DEFAULT 2 COMMENT 'コンディションコード（1:好調, 2:普通, 3:疲れ気味, 4:体調不良）',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_user_date (user_id, clock_in),
    INDEX idx_group_date (group_id, clock_in),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
