/**
 * 勤怠一覧コンポーネント
 * 勤怠ログの表示と編集機能を担当
 */
window.AttendanceList = {
  /**
   * 編集モーダルを開く
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   * @param {number} idx - 編集するログのインデックス
   */
  openEditModal(app, idx) {
    const log = app.logs[idx];
    app.editLog = { ...log };
    app.editLogIndex = idx;
    app.showEditModal = true;
  },

  /**
   * ログ編集を保存
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  saveEditLog(app) {
    app.logs = window.AttendanceManager.saveEditLog(app.logs, app.editLogIndex, app.editLog);
    
    // TODO: サーバーに編集データを送信（フェーズ2で実装）
    console.log('勤怠データを編集しました:', app.editLog);
    
    app.showEditModal = false;
  },

  /**
   * 所感モーダルを表示
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  showMemoModal(app) {
    app.showMemo = true;
    window.UIManager.preventBodyScroll();
  },

  /**
   * 所感を保存
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  saveMemo(app) {
    app.logs = window.AttendanceManager.saveMemo(app.logs, app.today, app.memoText);
    
    // UI状態をリセット
    app.memoText = '';
    app.showMemo = false;
    window.UIManager.restoreBodyScroll();
    
    // TODO: サーバーにメモデータを送信（フェーズ2で実装）
    console.log('メモを保存しました:', app.memoText);
  }
};
