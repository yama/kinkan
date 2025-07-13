# データベース設計

## テーブル構成概要

ユーザー、ゲストユーザー、グループ、グループメンバー、勤怠データの5テーブル構成。
LaraCREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    group_id BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '未所属の場合は0（個人利用グループ）をセット',
    clock_in DATETIME NOT NULL,
    clock_out DATETIME,
    memo TEXT,
    condition_code TINYINT NOT NULL DEFAULT 2 COMMENT 'コンディションコード（1:好調, 2:普通, 3:疲れ気味, 4:体調不良）',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_user_date (user_id, clock_in),
    INDEX idx_group_date (group_id, clock_in),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;計。

## DDL (Data Definition Language)

```sql
-- 正規ユーザーテーブル
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    display_name VARCHAR(100),
    is_temporary BOOLEAN NOT NULL DEFAULT TRUE COMMENT '一時ユーザーかどうか',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 一時ユーザーテーブル（temporary_users）
CREATE TABLE temporary_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'この一時ユーザーに対応するusersテーブルID（is_temporary=TRUE）',
    identifier VARCHAR(255) UNIQUE NOT NULL COMMENT 'クッキー連携用一意識別子',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- グループテーブル
CREATE TABLE groups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_code VARCHAR(7) NOT NULL DEFAULT '#3B82F6' COMMENT 'UIカラー',
    closing_day TINYINT NOT NULL DEFAULT 31 COMMENT '締め日(1-31)',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 設計ポイント

- **一時ユーザー管理**: 一時ユーザーも users テーブルに登録（is_temporary=TRUE で区別）
- **temporary_users テーブル**: クッキー識別子管理用の補助テーブル
- **勤怠データ一元管理**: attendance テーブルは users.id で一元管理
- **昇格処理**: 昇格時は users.is_temporary を FALSE に変更
- **memoはTEXT型**: 余裕を持たせ、日本語運用のためutf8mb4_general_ciを指定
- **clock_in/clock_outはDATETIME型**: 日付またぎ勤務にも対応
- **groupsテーブルのclosing_day**: グループ単位の締め日を設定（月末日超過時は自動調整）
- **グループ・役割ベース**: ユーザーはグループごとに異なる役割を持つことが可能
- **condition_emoji**: コンディションを絵文字で記録（😊😐😴🤒等）
- **グループ管理機能**: チーム・プロジェクトの役割を統合
- **attendanceテーブルにgroup_id**: 勤怠データをグループ単位で管理
- **color_code**: UIでのグループ識別用カラー
