/**
 * 打刻ウィジェットコンポーネント
 * 出勤・退勤ボタンとメッセージ表示を担当
 */
window.ClockWidget = {
  /**
   * 出勤処理の実行
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  clockIn(app) {
    const result = window.AttendanceManager.clockIn(app.logs, app.today);
    
    // 状態を更新
    app.logs = result.logs;
    app.hasClockedIn = result.hasClockedIn;
    app.lastAction = result.lastAction;
    app.clockInMessage = result.clockInMessage;
    app.showClockInMessage = true;
    
    // ストレージに保存
    window.StorageManager.saveAttendanceData({
      logs: app.logs,
      hasClockedIn: app.hasClockedIn,
      lastAction: app.lastAction
    });
  },

  /**
   * 退勤モーダル表示
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  showClockOutModal(app) {
    app.showMemoOnClockOut = true;
    window.UIManager.preventBodyScroll();
  },

  /**
   * メモ付き退勤処理の完了
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  completeMemoAndClockOut(app) {
    const result = window.AttendanceManager.clockOut(app.logs, app.today, app.memoText);
    
    // 状態を更新
    app.logs = result.logs;
    app.hasClockedIn = result.hasClockedIn;
    app.lastAction = result.lastAction;
    app.clockOutMessage = result.clockOutMessage;
    
    // UI状態をリセット
    app.memoText = '';
    app.showMemoOnClockOut = false;
    app.showClockOutMessage = true;
    window.UIManager.restoreBodyScroll();
    
    // ストレージに保存
    window.StorageManager.saveAttendanceData({
      logs: app.logs,
      hasClockedIn: app.hasClockedIn,
      lastAction: app.lastAction
    });
  },

  /**
   * メモをスキップして退勤処理を完了
   * @param {Object} app - Alpine.jsアプリケーションインスタンス
   */
  skipMemoAndClockOut(app) {
    const result = window.AttendanceManager.clockOut(app.logs, app.today);
    
    // 状態を更新
    app.logs = result.logs;
    app.hasClockedIn = result.hasClockedIn;
    app.lastAction = result.lastAction;
    app.clockOutMessage = result.clockOutMessage;
    
    // UI状態をリセット
    app.showMemoOnClockOut = false;
    app.showClockOutMessage = true;
    window.UIManager.restoreBodyScroll();
    
    // ストレージに保存
    window.StorageManager.saveAttendanceData({
      logs: app.logs,
      hasClockedIn: app.hasClockedIn,
      lastAction: app.lastAction
    });
  }
};
