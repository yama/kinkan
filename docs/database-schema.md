# データベース設計

## テーブル構成概要

ユーザー、チーム、チームメンバー、勤怠データの4テーブル構成。
Laravel移行も考慮したDB設計。

## DDL (Data Definition Language)

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(100),
    sso_provider VARCHAR(50),
    sso_id VARCHAR(255),
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- チームテーブル
CREATE TABLE teams (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    closing_day TINYINT DEFAULT 31 COMMENT '締め日(1-31)',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- チームメンバー・役割テーブル
CREATE TABLE team_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 勤怠データテーブル
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    clock_in DATETIME NOT NULL,
    clock_out DATETIME,
    memo TEXT,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

## 設計ポイント

- **memoはTEXT型**: 余裕を持たせ、日本語運用のためutf8mb4_general_ciを指定
- **clock_in/clock_outはDATETIME型**: 日付またぎ勤務にも対応
- **teamsテーブルのclosing_day**: チーム単位の締め日を設定（月末日超過時は自動調整）
- **チーム・役割ベース**: ユーザーはチームごとに異なる役割を持つことが可能
