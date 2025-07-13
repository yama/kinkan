# コーディング規約

## JavaScript (ES6+)

### モジュール分割指針

- **機能単位でのファイル分割**: 勤怠管理、DB操作、UI操作など
- **Alpine.js### PHP処理層の構造設計

プロジェクトの成長に合わせて、適切な処理層の分離とアーキテクチャを設計します。

#### ディレクトリ構成ーネント分割**: 打刻ウィジェット、勤怠一覧など
- **設定ファイル分離**: API エンドポイント、定数値など

### ファイル命名規則

```text
js/
├── modules/
│   ├── attendance.js     # 勤怠管理クラス
│   ├── storage.js        # DB操作管理
│   └── ui.js            # UI操作ユーティリティ
├── components/
│   ├── clock-widget.js   # 打刻ウィジェット
│   ├── attendance-list.js # 勤怠一覧
│   └── condition-selector.js # コンディション選択（フェーズ1）
├── config.js            # 設定値
└── app.js              # メインコントローラー
```

## CSS (Tailwind CSS)

### 基本方針

- **CDN経由のTailwind CSS**を使用
- **カスタムCSS最小化**: Tailwindのユーティリティクラス優先
- **レスポンシブファースト**: モバイル→デスクトップの順で設計

## HTML5

### 構造化指針

- **セマンティックHTML**: 適切なHTML要素の使用
- **Alpine.js ディレクティブ**: `x-data`, `x-show`, `x-on`等の適切な使用
- **アクセシビリティ**: WAI-ARIAガイドラインの考慮

## PHP (フェーズ2以降)

### 設定ファイル管理

- DB接続情報は `config/database.php` などの専用ファイルに分離すること
- 設定ファイルは公開リポジトリの場合 `.gitignore` で除外すること
- 必要に応じて `.env` ファイルや環境変数も利用可能

### パス管理

- **定数ベースのパス管理**: `__DIR__`による相対パスではなく、定数を使用
- **プロジェクトルート定義**: `PROJECT_ROOT`などの基準パスを定義
- **パス定数の分離**: `config/paths.php`での一元管理
- **ブートストラップファイル**: 共通読み込み処理の集約

#### パス定数の例

```php
// config/paths.php
define('PROJECT_ROOT', dirname(__DIR__));
define('CONFIG_PATH', PROJECT_ROOT . '/config');
define('INCLUDES_PATH', PROJECT_ROOT . '/includes');
define('API_PATH', PROJECT_ROOT . '/api');
define('TEMPLATES_PATH', PROJECT_ROOT . '/templates');
```

#### 使用例

```php
// 推奨（定数使用）
require_once CONFIG_PATH . '/database.php';
require_once INCLUDES_PATH . '/Database.php';

// 非推奨（相対パス）
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Database.php';
```

### API設計原則

- **RESTful API**: 標準的なHTTPメソッドとステータスコードの使用
- **JSON形式**: リクエスト・レスポンスともにJSON
- **エラーハンドリング**: 適切なエラーレスポンスの返却

## フェーズ1 UI/UXガイドライン

### コンディション記録

- **絵文字ベース**: 😊😐😴🤒などの直感的な選択
- **ワンタップ選択**: 退勤時の簡単入力
- **視覚的フィードバック**: 選択状態の明確な表示

### 削除機能

- **確認ダイアログ**: 誤削除防止
- **アンドゥ機能**: 削除直後の復元オプション（検討）

## PHP処理層の構造設計

プロジェクトの成長に合わせて、適切な処理層の分離とアーキテクチャを設計します。

### ディレクトリ構成

```text
includes/
├── Database.php              # DB接続管理（シングルトン）
├── ApiHelper.php            # API共通処理
├── TemporaryUserManager.php  # 一時ユーザー管理
├── models/                   # データモデル層
│   ├── BaseModel.php         # 基底モデルクラス
│   ├── User.php              # ユーザーモデル
│   ├── TemporaryUser.php     # 一時ユーザーモデル
│   └── Attendance.php        # 勤怠データモデル
├── controllers/              # コントローラー層
│   ├── BaseController.php    # 基底コントローラー
│   ├── UserController.php    # ユーザー管理
│   └── AttendanceController.php # 勤怠データ管理
├── services/                 # ビジネスロジック層
│   ├── UserService.php       # ユーザー関連処理
│   └── AttendanceService.php # 勤怠関連処理
└── validators/               # バリデーション層
    ├── UserValidator.php     # ユーザーデータ検証
    └── AttendanceValidator.php # 勤怠データ検証
```

#### 処理層の責務

##### 1. Model層（データアクセス）
- データベースとの直接やり取り
- CRUD操作の実装
- データの整合性確保

```php
// 例: Attendanceモデル
class Attendance extends BaseModel {
    public function create(array $data): int;
    public function findByUserId(int $userId, array $filters = []): array;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
```

##### 2. Service層（ビジネスロジック）
- 複数モデルを跨ぐ処理
- ビジネスルールの実装
- トランザクション管理

```php
// 例: AttendanceService
class AttendanceService {
    public function clockIn(int $userId, array $data): array;
    public function clockOut(int $userId, int $attendanceId, array $data): array;
    public function getAttendanceList(int $userId, array $filters = []): array;
}
```

##### 3. Controller層（API処理）
- HTTPリクエスト/レスポンス処理
- 認証・認可チェック
- バリデーション実行
- Serviceへの処理移譲

```php
// 例: AttendanceController
class AttendanceController extends BaseController {
    public function store(): void;
    public function index(): void;
    public function update(int $id): void;
    public function destroy(int $id): void;
}
```

##### 4. Validator層（入力検証）
- 入力データの検証
- エラーメッセージ生成
- セキュリティチェック

#### 基底クラスの活用

```php
// BaseController例
abstract class BaseController {
    protected function sendJson(array $data, int $status = 200): void;
    protected function sendError(string $message, int $status = 400): void;
    protected function validateCsrf(): bool;
    protected function getCurrentUserId(): ?int;
}

// BaseModel例  
abstract class BaseModel {
    protected Database $db;
    protected string $table;
    
    public function __construct();
    protected function execute(string $sql, array $params = []): PDOStatement;
    protected function fetchAll(string $sql, array $params = []): array;
}
```

#### エラーハンドリング

- **カスタム例外クラス**: `ValidationException`, `DatabaseException`, `AuthException`等
- **統一エラーレスポンス**: JSON形式での一貫したエラー返却
- **ログ記録**: エラー発生時の適切なログ出力

#### セキュリティ考慮事項

- **SQLインジェクション対策**: プリペアドステートメント必須
- **XSS対策**: 出力時のエスケープ処理
- **CSRF対策**: トークン検証（フェーズ2以降）
- **入力検証**: 全API入力の厳密な検証
