# ユーザ設定機能設計書

## 概要

フェーズ1でのユーザ名変更機能の設計・実装詳細を記載。DB運用ベースでのシンプルな実装を行い、フェーズ2以降のアカウント機能実装時にも移行しやすい設計とする。

## 機能仕様

### 基本要件

- **バリデーション**: 文字数制限（1-50文字）、空文字チェック
- **UI/UX**: インライン編集、キーボードショートカット対応
- **永続化**: DB（users テーブル）での設定保存

### データ仕様

#### DBテーブル（users）

```text
display_name カラム
```

#### データ構造（DBテーブル）

```sql
-- users テーブル内
display_name VARCHAR(100),
created_at TIMESTAMP,
updated_at TIMESTAMP
```

### バリデーション

- **文字数**: 1文字以上50文字以内
- **文字種**: 制限なし（絵文字含む）
- **必須**: 空文字・空白のみは不可

## 技術仕様

### ファイル構成

```text
js/
├── modules/
│   └── user-settings.js     # ユーザ設定管理クラス
├── components/
│   └── user-name-editor.js  # ユーザ名編集コンポーネント
└── app.js                   # 既存ファイル（グローバル初期化追加）
```

### API設計

#### UserSettings クラス

```javascript
class UserSettings {
    // ユーザ設定の取得
    getSettings(): Object
    
    // ユーザ設定の保存
    saveSettings(settings: Object): Object
    
    // ユーザ名の更新
    updateDisplayName(newName: string): Object
    
    // ユーザ名の取得
    getDisplayName(): string
}
```

#### Alpine.js コンポーネント

```javascript
Alpine.data('userNameEditor', () => ({
    // 状態管理
    isEditing: boolean,
    currentName: string,
    editingName: string,
    error: string,
    
    // メソッド
    startEdit(): void,
    cancelEdit(): void,
    saveUserName(): Promise<void>,
    handleKeydown(event): void
}))
```

### イベント仕様

#### カスタムイベント

```javascript
// ユーザ名変更時に発火
window.dispatchEvent(new CustomEvent('userNameChanged', {
    detail: { displayName: string }
}));
```

## UI設計

### 表示パターン

1. **表示モード**: ユーザ名 + 「変更」ボタン
2. **編集モード**: テキスト入力 + 「保存」「キャンセル」ボタン

### インタラクション

- **変更開始**: 「変更」ボタンクリックで編集モードに切り替え
- **保存**: 「保存」ボタンまたはEnterキーで保存
- **キャンセル**: 「キャンセル」ボタンまたはEscapeキーでキャンセル
- **エラー表示**: バリデーションエラー時は入力欄下部に赤文字で表示

### レスポンシブ対応

- **デスクトップ**: インライン表示
- **モバイル**: フルワイズで表示、タップしやすいボタンサイズ

## フェーズ2移行設計

### アカウント機能追加時の考慮事項

1. **データ紐付け**: ゲストユーザーから本登録ユーザーへの設定移行
2. **同期機能**: 複数デバイス間でのユーザ設定同期
3. **競合解決**: 複数デバイス間での設定変更競合の解決

### 拡張予定機能

- **プロフィール画像**: アバター画像の設定
- **テーマ設定**: ダーク/ライトモード切り替え
- **言語設定**: 多言語対応時の言語選択
- **タイムゾーン**: 勤怠データの時刻表示設定

## 実装優先度

### 高優先度

- [x] UserSettings クラスの実装
- [x] userNameEditor コンポーネントの実装
- [x] 基本的なUI/UX

### 中優先度

- [ ] エラーハンドリングの強化
- [ ] アクセシビリティ対応
- [ ] 既存コンポーネントとの連携

### 低優先度

- [ ] アニメーション効果
- [ ] 設定画面の分離
- [ ] 設定のエクスポート/インポート

## テスト観点

### 機能テスト

- ユーザ名の正常変更
- バリデーションエラーの表示
- キーボードショートカットの動作

### UI/UXテスト

- レスポンシブデザインの確認
- タッチデバイスでの操作性
- エラー状態の視認性

### データ整合性テスト

- 他コンポーネントへの変更通知
- ページリロード後の状態保持
