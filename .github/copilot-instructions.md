# カジュアル勤怠アプリ - GitHub Copilot カスタム指示

このプロジェクトは**提案用のモックアプリ**です。実際の業務システムではなく、コンセプトやUIデザインを示すためのプロトタイプとして開発されています。

## 技術的制約

レンタルサーバーでの動作を前提とし、サーバーサイド言語（PHP）とデータベース（MySQL）が利用可能です。フロントエンド技術に加えて、バックエンドAPI開発も含まれます。

アカウントがなくても利用可能ですが、アカウントを作成した場合は以下の仕様となります：
- アカウントには「管理者」「働く人」といった属性は付与しません。
- ユーザーは「チーム」を作成・参加でき、チームごとに役割（例：勤怠承認者、メンバーなど）を設定します。
- 役割はチーム単位で決まり、同じユーザーでもチームごとに異なる役割を持つことができます（例：AさんとBさんの役割がチームごとに逆転することも可能）。

### DB設計（Laravel移行も考慮）

#### DBテーブル構成例

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

・memoはTEXT型で余裕を持たせ、日本語運用のためutf8mb4_general_ciを指定。
・clock_in/clock_outはDATETIME型で日付またぎ勤務にも対応。
・ユーザー、チーム、チームメンバー、勤怠データの4テーブル構成。

## 使用技術スタック

### フロントエンド
- **HTML5**
- **Tailwind CSS**（CDN経由）
- **Alpine.js**（CDN経由）
- **JavaScript (ES6+)**

### バックエンド
- **PHP**
- **MySQL**
- **REST API**（JSON形式）

## 開発計画（フェーズ分け）

### フェーズ1：基本機能の実装（モック＋ローカルストレージ中心）
- 勤怠データの入力・編集・削除（打刻、日付、時刻、メモ等）
- 勤怠データのローカルストレージ保存・読込
- サンプルデータの初期表示
- レスポンシブ対応UI（Tailwind CSS＋Alpine.js）
- データの一覧表示・簡易集計
- UI/UXの見た目調整（デモンストレーション重視）

### フェーズ2：アカウント・認証・DB連携
- アカウント作成・ログイン画面の実装
- PHP＋MySQLによるユーザー管理APIの作成
- ログイン後、ローカルストレージの勤怠データをDBへインポート
- DBとの同期機能（ローカル⇔サーバー）
- サーバーサイドAPI（REST/JSON形式）の実装
- エラーハンドリング・バリデーションの強化
- **SSO（シングルサインオン）によるログイン機能の検討・実装（GitHubアカウントやGoogleアカウントでの認証対応）**

### フェーズ3：拡張・運用準備
- パスワードリセット等の補助機能
- 勤怠データのエクスポート（CSV等）
- 管理者向け簡易画面（必要に応じて）
- コード整理・リファクタリング
- ドキュメント整備
