# ユーザーアカウント運用・保存先仕様まとめ

## 1. 仮アカウント（名無しユーザー）運用方針

- 初回アクセス時に一意の guest_token（例: UUID）を生成し、クッキーや localStorage に保存
- DB の guest_users テーブルに仮ユーザーを作成し、guest_token と紐付け
- クッキー消去までは同じユーザーとして利用可能
- 本登録時は guest ユーザーのレコードをアップグレード（email 等を追加、is_guest=0 に変更）

## 2. DB 設計変更案

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100),
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE guest_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    guest_token VARCHAR(255) UNIQUE NOT NULL COMMENT '仮アカウント用一意トークン',
    display_name VARCHAR(100),
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE user_sso_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    sso_provider VARCHAR(50) NOT NULL,
    sso_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

## 3. クッキー/ローカルストレージによる紐付け方法

- guest_token をクッキーや localStorage に保存
- API リクエスト時に guest_token を送信し、DB の仮ユーザーと紐付け
- 本登録時は guest_token を引き継いでユーザー情報をアップグレード

## 4. 保存先仕様

- 利用者が限定されている間は、未ログインでも DB 保存に一本化することで実装・保守がシンプル
- ローカルストレージは一時保存やキャッシュ用途のみ
- ストレージ種別切り替え抽象化は不要になる

## 5. ストレージ抽象化の設計方針

- ユーザー状態（未ログイン／ログイン）で保存先を切り替える場合は、StorageManager などの抽象クラス／インターフェースを設計
- 実装は LocalStorage 版・API 版の 2 種類を用意
- ユーザー状態で自動的に切り替える仕組みを導入

## 6. 仕様変更のメリット・デメリット

### メリット

- 実装・テスト・運用が簡単
- データ一元管理による信頼性向上
- 将来的な機能追加（集計・分析・管理画面等）が容易

### デメリット

- オフライン利用や即時反映性はやや低下
- サーバー側の負荷や障害時の影響が大きくなる

---

この資料は 2025年7月12日 の議論内容をもとに作成しています。
