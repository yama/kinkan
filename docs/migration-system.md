# マイグレーション管理システム

## 概要

プロジェクトの設定ファイルを読み込んで安全にDBスキーマ変更を実行できるCLIベースのマイグレーション管理システム。LaravelやCakePHPのマイグレーション機能に似た操作感を提供します。

## システム構成

### ファイル構成

```text
cli/
└── migrate.php              # マイグレーション実行コマンド

includes/
└── Migration.php            # マイグレーション管理クラス

database/
├── migrations/              # マイグレーションファイル格納
│   ├── 001_create_users_table.sql
│   ├── 002_create_temporary_users_table.sql
│   ├── 003_create_groups_table.sql
│   └── 004_create_attendance_table.sql
└── create_tables.sql        # 既存ファイル（統合後は削除予定）
```

### マイグレーション管理テーブル

```sql
CREATE TABLE migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_migration (migration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## CLIコマンド

### 基本的な使用方法

```bash
# マイグレーション状況確認
php cli/migrate.php status

# 未実行のマイグレーションを実行
php cli/migrate.php migrate

# マイグレーションテーブル初期化
php cli/migrate.php init

# ヘルプ表示
php cli/migrate.php help
```

### コマンド詳細

#### status
- 全マイグレーションファイルの実行状況を表示
- 実行済み/未実行の区別と実行バッチ番号を表示

#### migrate
- 未実行のマイグレーションを順次実行
- 各マイグレーションをトランザクション内で実行
- 実行履歴をmigrationsテーブルに記録

#### init
- マイグレーション管理テーブルを初期化
- 初回実行時やテーブル破損時に使用

## マイグレーションファイル仕様

### 命名規則
- `{番号}_{説明}.sql` 形式
- 番号は3桁ゼロパディング推奨
- 例：`001_create_users_table.sql`

### ファイル内容
- 標準的なSQL DDL文
- 複数のCREATE TABLE文も対応
- コメント行（`--`）は実行時に除去

### 実行順序
- ファイル名のアルファベット順で実行
- 番号プレフィックスにより確実な順序制御

## 安全性機能

### トランザクション管理
- 各マイグレーションファイルを個別のトランザクションで実行
- エラー発生時は自動ロールバック

### 重複実行防止
- 実行済みマイグレーションは再実行されない
- migrationsテーブルでの実行履歴管理

### エラーハンドリング
- SQLエラー時の詳細メッセージ表示
- ファイル不存在エラーの適切な処理

## 設定ファイル連携

### 自動設定読み込み
- `config/database.php`から接続情報を自動取得
- パスワード等の手動入力不要

### プロジェクト構造対応
- bootstrap/app.phpによる統一的な初期化
- パス定数による柔軟なファイル配置

## 実装の利点

1. **安全性**: 設定ファイル読み込みによる入力ミス防止
2. **確実性**: トランザクション管理による一貫性保証
3. **可視性**: status コマンドによる実行状況の明確化
4. **馴染みやすさ**: Laravel風のコマンド体系
5. **拡張性**: 将来的なロールバック機能等の追加が容易

## 今後の拡張可能性

- ロールバック機能（rollback コマンド）
- マイグレーションファイル生成機能（make:migration コマンド）
- シード機能（seed コマンド）
- 本番環境向けの確認プロンプト機能
