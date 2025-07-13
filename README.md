
# 勤怠さん - チーム・役割ベース勤怠管理Webアプリ 🕐

**登録不要で今すぐ使える勤怠管理、チーム利用時は本格的な権限管理も可能**

個人利用なら登録せずにずっと使い続けられます。チーム運用が必要になったときは、アカウント作成でデータを引き継ぎながら権限管理機能が利用できます。

## 📋 概要

このプロジェクトは、DB運用を前提とした本格的な勤怠管理Webアプリケーションです。アカウントなしでも利用可能（ゲスト利用）、アカウント作成時はチームごとに役割（承認者・メンバー等）を柔軟に設定できます。データ保存先はDBとなり、レンタルサーバーでの運用を想定しています。

## ✨ 特徴

- **アカウントなしでも利用可能** - ゲスト利用時もDBに勤怠データを保存
- **アカウント作成・チーム/役割管理** - 登録後はチームごとに承認者・メンバー等の役割を柔軟に設定
- **レスポンシブデザイン** - どのデバイスでも使いやすいUI
- **SSO対応（予定）** - GitHubやGoogleアカウントでのログイン機能
- **データエクスポート** - CSV形式での勤怠データ出力

## 🛠️ 技術スタック

### フロントエンド
- HTML5
- Tailwind CSS（CDN経由）
- Alpine.js（CDN経由）
- JavaScript（ES6+）

### バックエンド
- PHP 8.0+
- MySQL 8.0+
- REST API（JSON形式）

## 🏗️ プロジェクト構成

```text
kinkan/
├── index.html          # メインページ
├── css/
│   └── styles.css     # カスタムスタイル
├── js/
│   └── app.js         # アプリケーションロジック
├── docs/              # 設計ドキュメント
│   ├── tech-stack.md
│   ├── system-specifications.md
│   ├── database-schema.md
│   ├── development-phases.md
│   └── coding-standards.md
├── api/               # PHP API (フェーズ2以降)
├── database/          # データベース設定 (フェーズ2以降)
└── favicon.svg        # ファビコン
```

## 📖 ドキュメント

詳細な仕様や設計情報は `docs/` フォルダを参照してください：

- [技術スタック](./docs/tech-stack.md) - 使用技術と制約事項
- [システム仕様](./docs/system-specifications.md) - アカウント・チーム管理仕様
- [DB設計](./docs/database-schema.md) - データベーステーブル構成
- [開発計画](./docs/development-phases.md) - フェーズ別実装計画
- [コーディング規約](./docs/coding-standards.md) - 開発時の規約

## 📊 データベース設計

### テーブル構成

- **users** - ユーザー情報（SSO対応）
- **teams** - チーム情報
- **team_members** - チームメンバーと役割
- **attendance** - 勤怠データ

### 主要フィールド

```sql
-- 勤怠データテーブル（例）
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    clock_in DATETIME NOT NULL,
    clock_out DATETIME,
    memo TEXT,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

## 🚀 開発フェーズ

### フェーズ1: 基本機能（現在）
- ✅ 勤怠データの入力・編集・削除
- ✅ アカウントなしでも利用可能（ゲスト運用）
- ✅ DBによるデータ保存・管理
- ✅ レスポンシブUI
- ✅ データ一覧表示・簡易集計

### フェーズ2: アカウント・DB連携
- 🔲 アカウント作成・ログイン画面
- 🔲 PHP + MySQL API実装
- 🔲 SSO認証機能
- 🔲 エラーハンドリング強化
- 🔲 管理者向け画面

### フェーズ3: 拡張・運用準備
- 🔲 パスワードリセット機能
- 🔲 CSVエクスポート機能
- 🔲 コードリファクタリング
- 🔲 ドキュメント整備

## 🎯 使用方法

### 開発環境での起動

1. プロジェクトをクローンまたはダウンロード
2. `index.html`をブラウザで開く
3. または、ローカルサーバーを起動：

```bash
# Python 3の場合
python -m http.server 8000

# Node.js (live-server)の場合
npx live-server
```

### 基本操作

1. **出勤打刻** - 「出勤」ボタンをクリック
2. **退勤打刻** - 「退勤」ボタンをクリック
3. **記録編集** - 一覧から編集したい記録を選択
4. **メモ追加** - 各記録にメモを追加可能

## 💡 設計思想

### アカウント・役割管理

- アカウントなしでも利用可能（ゲスト運用）
- アカウント作成時はチームごとに役割（承認者・メンバー等）を柔軟に設定
- 固定属性（管理者/一般）は付与せず、チーム単位で動的に権限管理

### データ設計

- UTF-8対応（日本語メモ等）
- 日付またぎ勤務対応
- DB設計は拡張性・セキュリティ重視

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🤝 貢献

シンプルで実用的な勤怠管理アプリを目指しています。機能改善やバグ報告、新機能の提案など、あらゆる貢献を歓迎します。お気軽にIssueやPull Requestをお送りください。

---

**注意**: このアプリケーションは実用を目的としていますが、重要な業務データを扱う場合は適切なバックアップとセキュリティ対策を行ってください。
