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
    async init() {
      try {
        // テンプレートを最初に読み込み（必須）
        await this.loadTemplates();
        
        // テンプレート読み込み後にデータを読み込み
        this.loadBasicData();
      } catch (error) {
        console.error('アプリケーションの初期化に失敗しました:', error);
        this.showError('テンプレートの読み込みに失敗しました。ページを再読み込みしてください。');
      }
    },

    // 基本データの読み込み
    loadBasicData() {
      // 勤怠データの読み込み
      const savedData = window.StorageManager?.loadAttendanceData();
      if (savedData) {
        this.logs = savedData.logs || this.logs;
        this.hasClockedIn = savedData.hasClockedIn || false;
        this.lastAction = savedData.lastAction || '未打刻です';
      }
      
      // ユーザー名の取得・初回入力
      const savedName = window.StorageManager?.loadUserName();
      if (savedName) {
        this.userName = savedName;
      } else {
        this.showNameModal = true;
      }
    },

    // テンプレート読み込み処理（必須）
    async loadTemplates() {
      if (!window.TemplateLoader) {
        throw new Error('TemplateLoader モジュールが読み込まれていません');
      }

      const templateConfigs = [
        { path: 'user-info-card.html', elementId: 'user-info-card' },
        { path: 'status-messages.html', elementId: 'status-messages' },
        { path: 'clock-buttons.html', elementId: 'clock-buttons' },
        { path: 'attendance-log-view.html', elementId: 'attendance-log-view' },
        { path: 'modals.html', elementId: 'modals' }
      ];

      await window.TemplateLoader.loadMultipleTemplates(templateConfigs);
    },

    // エラー表示
    showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed inset-0 flex items-center justify-center bg-red-50 z-50';
      errorDiv.innerHTML = `
        <div class="bg-white border border-red-200 rounded-2xl shadow-xl p-6 max-w-md mx-4">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 class="text-xl font-bold text-red-800">エラー</h2>
          </div>
          <p class="text-red-700 mb-4">${message}</p>
          <button 
            class="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            onclick="location.reload()">
            ページを再読み込み
          </button>
        </div>
      `;
      document.body.appendChild(errorDiv);
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
  // すべてのモジュールが読み込まれるまで少し待つ
  setTimeout(() => {
    window.attendanceApp = attendanceApp;
  }, 100);
});