# API仕様書（フェーズ1）

## 概要

フェーズ1では、一時ユーザー向けの基本的な勤怠管理APIを実装します。

## 基本方針

- **REST APIベース**: HTTP メソッドとステータスコードを適切に使用
- **JSON形式**: リクエスト・レスポンスともにJSON
- **一時ユーザー対応**: クッキーベースの一意識別子で管理
- **シンプル設計**: フェーズ2でのアカウント機能追加に備えた拡張性

## エンドポイント設計

### 基本URL構成

```text
/api/v1/
├── attendance/     # 勤怠データ操作
└── user/          # 一時ユーザー管理
```

## 1. 一時ユーザー管理 API

### POST /api/v1/user/temporary

**説明**: 一時ユーザーを作成し、クッキー識別子を発行

**リクエスト**:

```json
{
  "display_name": "テストユーザー" // オプション
}
```

**レスポンス** (201):

```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "identifier": "tmp_user_abc123def456",
    "display_name": "テストユーザー",
    "is_temporary": true
  }
}
```

## 2. 勤怠データ API

### GET /api/v1/attendance

**説明**: 勤怠データ一覧を取得

**クエリパラメータ**:

- `year`: 年（YYYY）
- `month`: 月（MM）
- `limit`: 取得件数（デフォルト: 50）

**リクエストヘッダー**:

```text
Cookie: temp_user_id=tmp_user_abc123def456
```

**レスポンス** (200):

```json
{
  "success": true,
  "data": {
    "attendance_records": [
      {
        "id": 1,
        "clock_in": "2025-01-15T09:00:00",
        "clock_out": "2025-01-15T18:00:00",
        "memo": "プロジェクトA対応",
        "condition_code": 1,
        "condition_name": "好調",
        "condition_emoji": "😊",
        "working_hours": "9:00",
        "group_id": null,
        "group_name": null,
        "created_at": "2025-01-15T09:00:00",
        "updated_at": "2025-01-15T18:00:00"
      }
    ],
    "total_count": 5,
    "current_page": 1
  }
}
```

### POST /api/v1/attendance

**説明**: 新しい勤怠データを登録

**リクエスト**:

```json
{
  "clock_in": "2025-01-15T09:00:00",
  "clock_out": "2025-01-15T18:00:00", // オプション（出勤のみの場合は省略）
  "memo": "プロジェクトA対応",        // オプション
  "condition_code": 1                // 1:好調, 2:普通, 3:疲れ気味, 4:体調不良
}
```

**レスポンス** (201):

```json
{
  "success": true,
  "data": {
    "id": 123,
    "clock_in": "2025-01-15T09:00:00",
    "clock_out": "2025-01-15T18:00:00",
    "memo": "プロジェクトA対応",
    "condition_code": 1,
    "condition_name": "好調",
    "condition_emoji": "😊",
    "working_hours": "9:00",
    "created_at": "2025-01-15T09:00:00",
    "updated_at": "2025-01-15T18:00:00"
  }
}
```

### PUT /api/v1/attendance/{id}

**説明**: 勤怠データを更新

**リクエスト**:

```json
{
  "clock_in": "2025-01-15T09:00:00",
  "clock_out": "2025-01-15T18:00:00",
  "memo": "プロジェクトA対応（修正）",
  "condition_code": 2
}
```

**レスポンス** (200):

```json
{
  "success": true,
  "data": {
    "id": 123,
    "clock_in": "2025-01-15T09:00:00",
    "clock_out": "2025-01-15T18:00:00",
    "memo": "プロジェクトA対応（修正）",
    "condition_code": 2,
    "condition_name": "普通",
    "condition_emoji": "😐",
    "working_hours": "9:00",
    "updated_at": "2025-01-15T19:00:00"
  }
}
```

### DELETE /api/v1/attendance/{id}

**説明**: 勤怠データを削除

**レスポンス** (200):

```json
{
  "success": true,
  "message": "勤怠データを削除しました"
}
```

## 3. エラーレスポンス

### 共通エラー形式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {} // オプション
  }
}
```

### エラーコード一覧

| HTTPステータス | エラーコード | 説明 |
|---------------|-------------|------|
| 400 | INVALID_REQUEST | リクエストパラメータが不正 |
| 401 | UNAUTHORIZED | 認証が必要 |
| 404 | NOT_FOUND | データが見つからない |
| 422 | VALIDATION_ERROR | バリデーションエラー |
| 500 | INTERNAL_ERROR | サーバー内部エラー |

## 4. セキュリティ仕様

### クッキー設定

```http
Set-Cookie: temp_user_id=tmp_user_abc123def456; 
            HttpOnly; 
            Secure; 
            SameSite=Strict; 
            Max-Age=2592000; // 30日
            Path=/
```

### バリデーション

- **日時形式**: ISO 8601形式（YYYY-MM-DDTHH:MM:SS）
- **文字数制限**: memo は最大1000文字
- **必須項目**: clock_in は必須
- **条件チェック**: clock_out は clock_in より後の時刻
- **コンディションコード**: 1-4の範囲内

### セキュリティ仕様

#### CSRFトークン

すべてのPOST/PUT/DELETEリクエストでCSRFトークンが必要：

```http
POST /api/v1/attendance
Content-Type: application/json
X-CSRF-Token: abc123def456...

{
  "clock_in": "2025-01-15T09:00:00",
  "condition_code": 1
}
```

#### レート制限

- **一般API**: 1分間に60リクエスト
- **認証API**: 1分間に10リクエスト

#### エラーレスポンス詳細

**400 Bad Request** - リクエストパラメータエラー：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値にエラーがあります",
    "details": {
      "clock_in": ["出勤時刻は必須です"],
      "memo": ["メモは1000文字以内で入力してください"]
    }
  }
}
```

**401 Unauthorized** - 認証エラー：

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です。一時ユーザーIDが無効または期限切れです。"
  }
}
```

**403 Forbidden** - CSRFトークンエラー：

```json
{
  "success": false,
  "error": {
    "code": "CSRF_TOKEN_MISMATCH",
    "message": "CSRFトークンが無効です。"
  }
}
```

**404 Not Found** - リソース未発見：

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定された勤怠データが見つかりません。"
  }
}
```

**422 Unprocessable Entity** - ビジネスロジックエラー：

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_LOGIC_ERROR",
    "message": "退勤時刻は出勤時刻より後にしてください。",
    "details": {
      "clock_in": "2025-01-15T18:00:00",
      "clock_out": "2025-01-15T09:00:00"
    }
  }
}
```

**429 Too Many Requests** - レート制限：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト回数の上限に達しました。しばらく時間をおいてから再度お試しください。",
    "details": {
      "retry_after": 60
    }
  }
}
```

**500 Internal Server Error** - サーバーエラー：

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "システムエラーが発生しました。しばらく時間をおいてから再度お試しください。"
  }
}
```

## 5. フェーズ2への拡張準備

以下の項目はフェーズ2で実装予定：

- JWT認証によるセッション管理
- グループベースの勤怠データ管理
- 役割ベースのアクセス制御（RBAC）
- 勤怠データの承認フロー
- 複数プロジェクト対応

## 6. データベース接続設定（実装時参考）

```php
// config/database.php（実装時）
<?php
return [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'database' => $_ENV['DB_DATABASE'] ?? 'kinkan',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
];
```
