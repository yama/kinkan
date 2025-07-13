# セキュリティ仕様書

## 概要

フェーズ1における一時ユーザー向けセキュリティ対策の仕様を定義します。

## 基本方針

- **レンタルサーバー対応**: 一般的なレンタルサーバー環境での実装を想定
- **段階的セキュリティ**: フェーズ1は基本対策、フェーズ2以降で本格的な認証
- **プライバシー保護**: 一時ユーザーでも適切なデータ保護を実施

## 1. 一時ユーザー管理セキュリティ

### クッキー設定

```http
Set-Cookie: temp_user_id=tmp_user_abc123def456; 
            HttpOnly; 
            Secure; 
            SameSite=Strict; 
            Max-Age=2592000; 
            Path=/
```

**設定詳細**:
- **HttpOnly**: JavaScriptからのアクセス防止（XSS対策）
- **Secure**: HTTPS接続時のみ送信（中間者攻撃対策）
- **SameSite=Strict**: CSRF攻撃防止
- **Max-Age=2592000**: 30日間有効
- **Path=/**: アプリケーション全体で有効

### 一意識別子生成

```php
// 実装例
function generateTemporaryUserId() {
    return 'tmp_user_' . bin2hex(random_bytes(16));
}
```

**要件**:
- **32文字のランダム文字列**: 推測困難
- **プレフィックス**: `tmp_user_` で識別
- **重複チェック**: DB登録前に既存確認

## 2. CSRF対策

### トークン管理

```php
// CSRFトークン生成
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// CSRFトークン検証
function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && 
           hash_equals($_SESSION['csrf_token'], $token);
}
```

**実装方針**:
- **セッション管理**: PHPセッションでトークン保存
- **フォーム埋め込み**: hidden inputでトークン送信
- **Ajax対応**: ヘッダーまたはPOSTパラメータで送信

### フロントエンド実装

```html
<!-- フォーム例 -->
<form x-data="attendanceForm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">
    <!-- ...existing form fields... -->
</form>
```

```javascript
// Ajax実装例
const response = await fetch('/api/v1/attendance', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify(data)
});
```

## 3. XSS対策

### 出力エスケープ

```php
// HTML出力時の基本エスケープ
function escapeHtml($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

// JSON出力時のエスケープ
function escapeJson($data) {
    return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
}
```

**実装規則**:
- **すべての動的コンテンツ**: HTMLエスケープ必須
- **JSON API**: 適切なContent-Typeヘッダー設定
- **メモフィールド**: 改行・HTMLタグの適切な処理

### Content Security Policy

```http
Content-Security-Policy: 
    default-src 'self'; 
    script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; 
    style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; 
    font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
```

## 4. SQLインジェクション対策

### 準備済みステートメント

```php
// PDO実装例
class DatabaseManager {
    private $pdo;
    
    public function insertAttendance($userId, $groupId, $clockIn, $clockOut, $memo, $conditionCode) {
        $sql = "INSERT INTO attendance 
                (user_id, group_id, clock_in, clock_out, memo, condition_code, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$userId, $groupId, $clockIn, $clockOut, $memo, $conditionCode]);
    }
    
    public function getAttendanceByUser($userId, $limit = 50) {
        $sql = "SELECT * FROM attendance WHERE user_id = ? ORDER BY clock_in DESC LIMIT ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

**実装規則**:
- **動的SQLの禁止**: 必ずプレースホルダーを使用
- **型チェック**: パラメータの型検証
- **エラーハンドリング**: 詳細なエラー情報の非表示

## 5. 入力値バリデーション

### サーバーサイドバリデーション

```php
class AttendanceValidator {
    public function validate($data) {
        $errors = [];
        
        // 必須項目チェック
        if (empty($data['clock_in'])) {
            $errors['clock_in'] = '出勤時刻は必須です';
        }
        
        // 日時形式チェック
        if (!empty($data['clock_in']) && !$this->isValidDatetime($data['clock_in'])) {
            $errors['clock_in'] = '出勤時刻の形式が正しくありません';
        }
        
        // 文字数制限
        if (!empty($data['memo']) && mb_strlen($data['memo']) > 1000) {
            $errors['memo'] = 'メモは1000文字以内で入力してください';
        }
        
        // 条件コードチェック
        if (!empty($data['condition_code']) && !in_array($data['condition_code'], [1, 2, 3, 4])) {
            $errors['condition_code'] = 'コンディションコードが不正です';
        }
        
        return $errors;
    }
    
    private function isValidDatetime($datetime) {
        return (bool) DateTime::createFromFormat('Y-m-d H:i:s', $datetime);
    }
}
```

### クライアントサイドバリデーション

```javascript
// Alpine.js バリデーション例
function attendanceForm() {
    return {
        formData: {
            clock_in: '',
            clock_out: '',
            memo: '',
            condition_code: 2
        },
        errors: {},
        
        validateForm() {
            this.errors = {};
            
            // 必須項目チェック
            if (!this.formData.clock_in) {
                this.errors.clock_in = '出勤時刻は必須です';
            }
            
            // 文字数制限
            if (this.formData.memo && this.formData.memo.length > 1000) {
                this.errors.memo = 'メモは1000文字以内で入力してください';
            }
            
            // 退勤時刻チェック
            if (this.formData.clock_out && this.formData.clock_in && 
                new Date(this.formData.clock_out) <= new Date(this.formData.clock_in)) {
                this.errors.clock_out = '退勤時刻は出勤時刻より後にしてください';
            }
            
            return Object.keys(this.errors).length === 0;
        }
    }
}
```

## 6. エラーハンドリング

### セキュアなエラーレスポンス

```php
class SecureErrorHandler {
    public function handleError($error, $isProduction = true) {
        // ログ記録（詳細情報）
        error_log("Error: " . $error->getMessage() . " in " . $error->getFile() . ":" . $error->getLine());
        
        // ユーザー向けレスポンス（最小限の情報）
        if ($isProduction) {
            return [
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。'
                ]
            ];
        } else {
            // 開発環境では詳細表示
            return [
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => $error->getMessage(),
                    'file' => $error->getFile(),
                    'line' => $error->getLine()
                ]
            ];
        }
    }
}
```

## 7. ログ・監査

### セキュリティログ

```php
class SecurityLogger {
    public function logUserAction($userId, $action, $details = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'user_id' => $userId,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'action' => $action,
            'details' => $details
        ];
        
        error_log("SECURITY_LOG: " . json_encode($logData));
    }
}
```

**ログ対象**:
- ユーザー登録・ログイン
- 勤怠データの作成・更新・削除
- 異常なアクセスパターン
- エラー発生状況

## 8. フェーズ2への拡張準備

### 認証システム移行

- **パスワードハッシュ化**: `password_hash()` / `password_verify()`
- **JWT トークン**: ステートレス認証への対応
- **多要素認証**: SMS・メール認証の準備
- **OAuth2連携**: 外部サービス認証の検討

### 権限管理

- **役割ベースアクセス制御**: admin/member権限
- **リソースレベル制御**: データアクセス範囲の制限
- **API レート制限**: 過度なリクエストの制御

## 実装チェックリスト

- [ ] クッキー設定の実装
- [ ] CSRF トークンの実装
- [ ] XSS対策の実装
- [ ] SQLインジェクション対策の実装
- [ ] 入力値バリデーションの実装
- [ ] エラーハンドリングの実装
- [ ] セキュリティログの実装
- [ ] CSP ヘッダーの設定
