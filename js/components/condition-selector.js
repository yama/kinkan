/**
 * コンディション選択コンポーネント（フェーズ1）
 * 体調・気分記録機能のプレースホルダー
 * 将来的に絵文字ベースのコンディション選択機能を実装予定
 */
window.ConditionSelector = {
  /**
   * 利用可能なコンディション絵文字一覧
   */
  CONDITIONS: [
    { emoji: '😊', label: '好調' },
    { emoji: '😐', label: '普通' },
    { emoji: '😴', label: '疲れ気味' },
    { emoji: '🤒', label: '体調不良' },
    { emoji: '💪', label: '絶好調' },
    { emoji: '😅', label: 'ちょっと疲れ' }
  ],

  /**
   * コンディション選択処理（プレースホルダー）
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   * @param {string} condition - 選択されたコンディション
   */
  selectCondition(app, condition) {
    // フェーズ1では未実装
    // 将来的にログにコンディション情報を追加する予定
    console.log('コンディション選択:', condition);
  },

  /**
   * 現在のコンディション絵文字を取得（プレースホルダー）
   * @param {Object} log - ログデータ
   * @returns {string} コンディション絵文字
   */
  getConditionEmoji(log) {
    // フェーズ1では未実装
    // 将来的にlog.condition_emojiを返す予定
    return log.condition_emoji || '';
  }
};
