/**
 * UI操作ユーティリティモジュール
 * UI関連の共通処理とヘルパー関数を提供
 */
window.UIManager = {
  /**
   * モーダル表示時に背景スクロールを防止
   */
  preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  },

  /**
   * モーダル非表示時に背景スクロールを復元
   */
  restoreBodyScroll() {
    document.body.style.overflow = '';
  },

  /**
   * 時刻別の挨拶メッセージを取得
   * @returns {string} 挨拶メッセージ
   */
  getGreetingMessage() {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11) {
      return 'おはようございます！';
    } else if (hour < 18) {
      return 'こんにちは';
    } else {
      return 'こんばんは';
    }
  },

  /**
   * 退勤時の挨拶メッセージを取得
   * @returns {string} 退勤時挨拶メッセージ
   */
  getClockOutGreetingMessage() {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 18) {
      return 'お疲れさまでした！';
    } else if (hour < 22) {
      return 'お疲れさまでした！';
    } else {
      return '遅くまでお疲れさまでした！';
    }
  },

  /**
   * 現在時刻を「HH:MM」形式で取得
   * @returns {string} 現在時刻
   */
  getCurrentTime() {
    return new Date().toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  /**
   * ランダムメッセージを取得
   * @param {Array} messages - メッセージ配列
   * @returns {string} ランダムメッセージ
   */
  getRandomMessage(messages) {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
};
