/**
 * カジュアル勤怠アプリのメインコントローラー
 * Alpine.js を使用して状態管理とUIの制御を行う
 * モジュール分割により、各機能は専用のコンポーネントに委譲
 */
function attendanceApp() {
  return {
    // 状態管理
    userName: '',
    tempUserName: '',
    showNameModal: false,
    currentView: 'main', // 'main' または 'log'
    today: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
    lastAction: '未打刻です',
    showLog: false,
    showMemo: false,
    showMemoOnClockOut: false,
    showClockInMessage: false,
    showClockOutMessage: false,
    clockInMessage: '',
    clockOutMessage: '',
    memoText: '',
    hasClockedIn: false,
    logs: window.AppConfig.SAMPLE_LOGS,
    showEditModal: false,
    editLog: { in: '', out: '', memo: '', date: '' },
    editLogIndex: null,

    // 日付フォーマット（AttendanceManagerに委譲）
    formatLogDate(dateStr) {
      return window.AttendanceManager.formatLogDate(dateStr);
    },

    // 挨拶メッセージ（UIManagerに委譲）
    get greetingMessage() {
      return window.UIManager.getGreetingMessage();
    },

    get clockOutGreetingMessage() {
      return window.UIManager.getClockOutGreetingMessage();
    },

    // コンポーネントメソッド（各コンポーネントに委譲）
    openEditModal(idx) {
      window.AttendanceList.openEditModal(this, idx);
    },
    saveEditLog() {
      window.AttendanceList.saveEditLog(this);
    },

    clockIn() {
      window.ClockWidget.clockIn(this);
    },

    clockOut() {
      window.ClockWidget.showClockOutModal(this);
    },

    completeMemoAndClockOut() {
      window.ClockWidget.completeMemoAndClockOut(this);
    },

    skipMemoAndClockOut() {
      window.ClockWidget.skipMemoAndClockOut(this);
    },

    saveMemo() {
      window.AttendanceList.saveMemo(this);
    },

    showMemoModal() {
      window.AttendanceList.showMemoModal(this);
    },

    // 初期化処理
    init() {
      // 勤怠データの読み込み
      const savedData = window.StorageManager.loadAttendanceData();
      if (savedData) {
        this.logs = savedData.logs || this.logs;
        this.hasClockedIn = savedData.hasClockedIn || false;
        this.lastAction = savedData.lastAction || '未打刻です';
      }
      
      // ユーザー名の取得・初回入力
      const savedName = window.StorageManager.loadUserName();
      if (savedName) {
        this.userName = savedName;
      } else {
        this.showNameModal = true;
      }
    },

    // ユーザー名保存
    saveUserName() {
      if (this.tempUserName.trim()) {
        this.userName = this.tempUserName.trim();
        window.StorageManager.saveUserName(this.userName);
        this.showNameModal = false;
      }
    }
  }
}
// Alpine.jsで使用できるようにグローバル変数として登録
document.addEventListener('DOMContentLoaded', function() {
  window.attendanceApp = attendanceApp;
});