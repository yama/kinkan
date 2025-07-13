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
    showDeleteModal: false,
    deleteTargetLog: null,
    deleteLogIndex: null,
    showSuccessMessage: false,
    successMessage: '',

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

    openDeleteModal(idx) {
      this.deleteLogIndex = idx;
      this.deleteTargetLog = this.logs[idx];
      this.showDeleteModal = true;
    },

    confirmDelete() {
      if (this.deleteLogIndex !== null) {
        const deletedLog = this.logs[this.deleteLogIndex];
        this.logs = window.AttendanceManager.deleteLog(this.logs, this.deleteLogIndex);
        // TODO: サーバーに削除リクエストを送信（フェーズ2で実装）
        console.log('勤怠データを削除しました:', deletedLog);
        
        // 削除完了メッセージを表示
        this.successMessage = `${this.formatLogDate(deletedLog.date)}の勤怠データを削除しました`;
        this.showSuccessMessage = true;
        
        // 5秒後に自動で非表示
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 5000);
      }
      this.showDeleteModal = false;
      this.deleteTargetLog = null;
      this.deleteLogIndex = null;
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
        // 1. 一時ユーザーの初期化（クッキー発行）
        await this.initializeUser();
        
        // 2. テンプレートを読み込み
        await this.loadTemplates();
        
        // 3. テンプレート読み込み後にデータを読み込み
        this.loadBasicData();
      } catch (error) {
        console.error('アプリケーションの初期化に失敗しました:', error);
        this.showError('アプリケーションの初期化に失敗しました。ページを再読み込みしてください。');
      }
    },

    // ユーザー初期化処理
    async initializeUser() {
      if (!window.UserManager) {
        console.warn('UserManager モジュールが読み込まれていません');
        return;
      }

      const success = await window.UserManager.initializeTemporaryUser();
      if (!success) {
        console.warn('一時ユーザーの初期化に失敗しましたが、ローカルモードで続行します');
      }

      // ユーザー情報をログ出力（デバッグ用）
      const userInfo = window.UserManager.getCurrentUserInfo();
      console.log('現在のユーザー情報:', userInfo);
    },

    // 基本データの読み込み
    loadBasicData() {
      // フェーズ1ではサンプルデータを使用（ローカルストレージ不使用）
      // TODO: フェーズ2でサーバーからデータ取得
      this.logs = window.AppConfig.SAMPLE_LOGS;
      this.hasClockedIn = false;
      this.lastAction = '未打刻です';
      
      // ユーザー名の初回入力（サーバー連携前）
      this.showNameModal = true;
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
        // TODO: サーバーにユーザー名を送信（フェーズ2で実装）
        console.log('ユーザー名を設定:', this.userName);
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