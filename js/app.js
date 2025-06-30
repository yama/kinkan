/**
 * カジュアル勤怠アプリのメインロジック
 * Alpine.js を使用して状態管理とUIの制御を行う
 */
function attendanceApp() {
  return {
    currentView: 'main', // 'main' または 'log'
    today: new Date().toLocaleDateString('ja-JP', { 
      weekday: 'short', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }),
    lastAction: '未打刻です',
    showLog: false,
    showMemo: false,
    showMemoOnClockOut: false,
    showClockInMessage: false,
    clockInMessage: '',
    memoText: '',
    hasClockedIn: false,
    clockInMessages: [
      '今日も一日がんばりましょう！ 🌟',
      '素敵な一日になりそうですね ☀️',
      '今日は何か新しいことにチャレンジしてみませんか？ 🚀',
      '作業がはかどる音楽はいかがですか？ 🎵 https://www.youtube.com/watch?v=F-hhrQ3BjRI',
      'コーヒーを一杯飲んで、リフレッシュしましょう ☕',
      '今日の目標を決めて、集中していきましょう 🎯',
      '深呼吸して、落ち着いて作業を始めましょう 🧘‍♀️',
      '今日も笑顔で過ごしましょう 😊',
      '小さな一歩でも、前進していきましょう 👣',
      '今日は特別な日になりそうな予感です ✨',
      '集中できる環境を整えて、効率よく進めましょう 🏃‍♂️',
      '今日も学びのある一日にしていきましょう 📚'
    ],
    logs: [
      { 
        date: '6/28（金）', 
        in: '09:59', 
        out: '18:13', 
        memo: '今日は会議が多めの日でした。新しいプロジェクトのキックオフもあり充実していました。' 
      },
      { 
        date: '6/27（木）', 
        in: '10:15', 
        out: '17:55', 
        memo: '集中してタスク処理できた一日。明日の準備も完了！' 
      },
      { 
        date: '6/26（水）', 
        in: '09:45', 
        out: '18:30', 
        memo: '資料作成に時間をかけました。良いものができたと思います。' 
      }
    ],
    
    init() {
      // LocalStorageからデータを読み込み
      const savedData = localStorage.getItem('attendanceData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.logs = data.logs || this.logs;
        this.hasClockedIn = data.hasClockedIn || false;
        this.lastAction = data.lastAction || '未打刻です';
      }
    },
    
    saveToStorage() {
      const data = {
        logs: this.logs,
        hasClockedIn: this.hasClockedIn,
        lastAction: this.lastAction
      };
      localStorage.setItem('attendanceData', JSON.stringify(data));
    },
    
    clockIn() {
      const time = new Date().toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      this.lastAction = `出勤 ${time}`;
      this.hasClockedIn = true;
      
      // ランダムメッセージを表示
      const randomIndex = Math.floor(Math.random() * this.clockInMessages.length);
      this.clockInMessage = this.clockInMessages[randomIndex];
      this.showClockInMessage = true;
      
      const todayStr = this.today.split(' ')[0];
      const existingLog = this.logs.find(log => log.date === todayStr);
      
      if (existingLog) {
        existingLog.in = time;
      } else {
        this.logs.unshift({ 
          date: todayStr, 
          in: time, 
          out: '--:--', 
          memo: '' 
        });
      }
      
      this.saveToStorage();
    },
    
    clockOut() {
      // 退勤時は所感入力フォームをモーダルで表示
      this.showMemoOnClockOut = true;
      // モーダル表示時に背景スクロールを防止
      document.body.style.overflow = 'hidden';
    },
    
    completeMemoAndClockOut() {
      const time = new Date().toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      this.lastAction = `退勤 ${time}`;
      this.hasClockedIn = false;
      
      const todayStr = this.today.split(' ')[0];
      const todayLog = this.logs.find(log => log.date === todayStr);
      
      if (todayLog) {
        todayLog.out = time;
        if (this.memoText.trim()) {
          todayLog.memo = this.memoText.trim();
        }
      } else {
        this.logs.unshift({ 
          date: todayStr, 
          in: '--:--', 
          out: time, 
          memo: this.memoText.trim() || '' 
        });
      }
      
      this.memoText = '';
      this.showMemoOnClockOut = false;
      // モーダルを閉じたらスクロールを戻す
      document.body.style.overflow = '';
      this.saveToStorage();
    },
    
    skipMemoAndClockOut() {
      const time = new Date().toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      this.lastAction = `退勤 ${time}`;
      this.hasClockedIn = false;
      
      const todayStr = this.today.split(' ')[0];
      const todayLog = this.logs.find(log => log.date === todayStr);
      
      if (todayLog) {
        todayLog.out = time;
      } else {
        this.logs.unshift({ 
          date: todayStr, 
          in: '--:--', 
          out: time, 
          memo: '' 
        });
      }
      
      this.showMemoOnClockOut = false;
      // モーダルを閉じたらスクロールを戻す
      document.body.style.overflow = '';
      this.saveToStorage();
    },
    
    saveMemo() {
      if (!this.memoText.trim()) return;
      
      const todayStr = this.today.split(' ')[0];
      const todayLog = this.logs.find(log => log.date === todayStr);
      
      if (todayLog) {
        todayLog.memo = this.memoText.trim();
      } else {
        this.logs.unshift({ 
          date: todayStr, 
          in: '--:--', 
          out: '--:--', 
          memo: this.memoText.trim() 
        });
      }
      
      this.memoText = '';
      this.showMemo = false;
      // モーダルを閉じたらスクロールを戻す
      document.body.style.overflow = '';
      this.saveToStorage();
    },
    
    // 所感モーダルを表示する関数
    showMemoModal() {
      this.showMemo = true;
      // モーダル表示時に背景スクロールを防止
      document.body.style.overflow = 'hidden';
    }
  }
}
// Alpine.jsで使用できるようにグローバル変数として登録
document.addEventListener('DOMContentLoaded', function() {
  window.attendanceApp = attendanceApp;
});
