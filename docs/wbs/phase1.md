# フェーズ1 WBS（作業分解構成）

このドキュメントは「勤怠さん」フェーズ1のWBSです。進捗済み項目はチェック済み、未完了項目はサブタスクを詳細化しています。

- [x] 勤怠データの入力・編集
- [x] 勤怠データのDB保存・読込
- [x] サンプルデータの初期表示
- [x] 勤怠データの削除機能
- [x] コード分割・モジュール化
- [ ] データ保存先の改修（DB/users + temporary_usersテーブル設計・実装）
  - [x] 仕様確認
  - [x] DB設計（Laravel準拠、外部キー制約対応）
  - [x] users + temporary_usersテーブル設計
  - [x] API設計（フェーズ1範囲：api-specifications-phase1.md）
  - [x] group_id NULL設計の確認（ダミーグループ不要）
  - [x] クッキー発行タイミングの実装（初回アクセス時）
  - [x] 一時ユーザー作成API実装
  - [ ] PHP処理層構造のリファクタリング
    - [ ] パス管理の改善（定数ベース）
      - [ ] config/paths.php 作成
      - [ ] bootstrap/app.php 作成
    - [ ] 基底クラスの実装
      - [ ] includes/models/BaseModel.php 作成
      - [ ] includes/controllers/BaseController.php 作成
    - [ ] マイグレーション管理システム（詳細：migration-system.md）
      - [ ] includes/Migration.php 作成
      - [ ] cli/migrate.php CLIコマンド作成
      - [ ] database/migrations/ ディレクトリ作成
      - [ ] 既存テーブル定義のマイグレーション化
    - [ ] 一時ユーザーAPIのリファクタリング
      - [ ] includes/models/User.php 作成
      - [ ] includes/models/TemporaryUser.php 作成
      - [ ] includes/services/UserService.php 作成
      - [ ] includes/validators/UserValidator.php 作成
      - [ ] includes/controllers/UserController.php 作成
    - [ ] APIルーティングの簡素化
      - [ ] .htaccess の簡素化
      - [ ] api/index.php 統一ルーター作成
    - ⏱️ 目安工数：1.5日
  - [ ] 勤怠データCRUD API実装
  - [ ] フロントエンド→API連携実装
  - [ ] エラーハンドリング実装
  - [ ] テスト（詳細：test-specifications-phase1.md）
    - [ ] API単体テスト（正常系・異常系）
    - [ ] 結合テスト（ユーザーフロー）
    - [ ] セキュリティテスト（XSS・CSRF・SQLインジェクション）
    - [ ] ブラウザ互換性テスト
  - ⏱️ 目安工数：3日
- [ ] コンディション記録機能（好調・普通・疲れ気味・体調不良など）
  - [ ] UI設計（絵文字選択）
  - [ ] Alpine.js連携
  - [ ] 保存ロジック
  - [ ] DB対応
  - [ ] 一覧表示への反映
  - [ ] テスト
  - ⏱️ 目安工数：1.5日

※工数は仮です。必要に応じて調整してください。
