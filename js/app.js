/**
 * カジュアル勤怠アプリのメインロジック
 * Alpine.js を使用して状態管理とUIの制御を行う
 */
function attendanceApp() {
  return {
    // ログ日付を「M/D（曜）」形式で表示する関数
    formatLogDate(dateStr) {
      // 既に「6/28（金）」形式ならそのまま返す
      if (/^\d{1,2}\/\d{1,2}（.）$/.test(dateStr)) return dateStr;
      
      // 汎用的な日付形式をDateオブジェクトで処理
      // ISO形式（YYYY-MM-DD）、YYYY/MM/DD、YYYY-MM-DD等に対応
      const d = new Date(dateStr + 'T00:00:00'); // タイムゾーン対応
      if (isNaN(d)) {
        // fallback: 他の形式も試す
        const d2 = new Date(dateStr);
        if (isNaN(d2)) return dateStr;
        const m = d2.getMonth() + 1;
        const day = d2.getDate();
        const week = '日月火水木金土'[d2.getDay()];
        return `${m}/${day}（${week}）`;
      }
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const week = '日月火水木金土'[d.getDay()];
      return `${m}/${day}（${week}）`;
    },
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
        date: '2025-06-28', 
        in: '09:59', 
        out: '18:13', 
        memo: '今日は会議が多めの日でした。新しいプロジェクトのキックオフもあり充実していました。' 
      },
      { 
        date: '2025-06-27', 
        in: '10:15', 
        out: '17:55', 
        memo: '集中してタスク処理できた一日。明日の準備も完了！' 
      },
      { 
        date: '2025-06-26', 
        in: '09:45', 
        out: '18:30', 
        memo: '資料作成に時間をかけました。良いものができたと思います。' 
      }
    ],
    showEditModal: false,
    editLog: { in: '', out: '', memo: '', date: '' },
    editLogIndex: null,
    openEditModal(idx) {
      const log = this.logs[idx];
      this.editLog = { ...log };
      this.editLogIndex = idx;
      this.showEditModal = true;
    },
    saveEditLog() {
      if (this.editLogIndex !== null) {
        // 日付が変更された場合は、ログを削除して新しい位置に挿入
        const originalDate = this.logs[this.editLogIndex].date;
        const newDate = this.editLog.date;
        
        if (originalDate !== newDate) {
          // 元のログを削除
          this.logs.splice(this.editLogIndex, 1);
          
          // 新しい日付で適切な位置に挿入（日付の降順を維持）
          const newLog = { ...this.editLog };
          let insertIndex = 0;
          
          // 新しい日付より新しいログの数を数える
          for (let i = 0; i < this.logs.length; i++) {
            if (this.logs[i].date > newDate) {
              insertIndex = i + 1;
            } else {
              break;
            }
          }
          
          this.logs.splice(insertIndex, 0, newLog);
        } else {
          // 日付が変更されていない場合は、そのまま更新
          this.logs[this.editLogIndex] = { ...this.editLog };
        }
        
        this.saveToStorage();
        this.showEditModal = false;
      }
    },
    
        get greetingMessage() {
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

    init() {
      // 勤怠データの読み込み
      const savedData = localStorage.getItem('attendanceData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.logs = data.logs || this.logs;
        this.hasClockedIn = data.hasClockedIn || false;
        this.lastAction = data.lastAction || '未打刻です';
      }
      // ユーザー名の取得・初回入力
      const savedName = localStorage.getItem('userName');
      if (savedName) {
        this.userName = savedName;
      } else {
        this.showNameModal = true;
      }
    },

    saveUserName() {
      if (this.tempUserName.trim()) {
        this.userName = this.tempUserName.trim();
        localStorage.setItem('userName', this.userName);
        this.showNameModal = false;
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
      
      const todayStr = this.today;
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
      
      const todayStr = this.today;
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
      
      const todayStr = this.today;
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
      
      const todayStr = this.today;
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
