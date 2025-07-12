/**
 * 勤怠管理モジュール
 * 勤怠データの操作とビジネスロジックを担当
 */
window.AttendanceManager = {
  /**
   * ログ日付を「M/D（曜）」形式で表示する
   * @param {string} dateStr - 日付文字列
   * @returns {string} フォーマット済み日付
   */
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

  /**
   * 出勤処理
   * @param {Array} logs - 勤怠ログ配列
   * @param {string} todayStr - 今日の日付（YYYY-MM-DD形式）
   * @returns {Object} 更新された状態
   */
  clockIn(logs, todayStr) {
    const time = window.UIManager.getCurrentTime();
    const lastAction = `出勤 ${time}`;
    
    const existingLog = logs.find(log => log.date === todayStr);
    
    if (existingLog) {
      existingLog.in = time;
    } else {
      logs.unshift({ 
        date: todayStr, 
        in: time, 
        out: '--:--', 
        memo: '' 
      });
    }
    
    return {
      logs,
      hasClockedIn: true,
      lastAction,
      clockInMessage: window.UIManager.getRandomMessage(window.AppConfig.CLOCK_IN_MESSAGES)
    };
  },

  /**
   * 退勤処理
   * @param {Array} logs - 勤怠ログ配列
   * @param {string} todayStr - 今日の日付（YYYY-MM-DD形式）
   * @param {string} memo - メモ
   * @returns {Object} 更新された状態
   */
  clockOut(logs, todayStr, memo = '') {
    const time = window.UIManager.getCurrentTime();
    const lastAction = `退勤 ${time}`;
    
    const todayLog = logs.find(log => log.date === todayStr);
    
    if (todayLog) {
      todayLog.out = time;
      if (memo.trim()) {
        todayLog.memo = memo.trim();
      }
    } else {
      logs.unshift({ 
        date: todayStr, 
        in: '--:--', 
        out: time, 
        memo: memo.trim() || '' 
      });
    }
    
    return {
      logs,
      hasClockedIn: false,
      lastAction,
      clockOutMessage: window.UIManager.getRandomMessage(window.AppConfig.CLOCK_OUT_MESSAGES)
    };
  },

  /**
   * メモ保存処理
   * @param {Array} logs - 勤怠ログ配列
   * @param {string} todayStr - 今日の日付（YYYY-MM-DD形式）
   * @param {string} memo - メモ
   * @returns {Array} 更新されたログ配列
   */
  saveMemo(logs, todayStr, memo) {
    if (!memo.trim()) return logs;
    
    const todayLog = logs.find(log => log.date === todayStr);
    
    if (todayLog) {
      todayLog.memo = memo.trim();
    } else {
      logs.unshift({ 
        date: todayStr, 
        in: '--:--', 
        out: '--:--', 
        memo: memo.trim() 
      });
    }
    
    return logs;
  },

  /**
   * ログ編集処理
   * @param {Array} logs - 勤怠ログ配列
   * @param {number} editLogIndex - 編集するログのインデックス
   * @param {Object} editLog - 編集後のログデータ
   * @returns {Array} 更新されたログ配列
   */
  saveEditLog(logs, editLogIndex, editLog) {
    if (editLogIndex === null) return logs;
    
    // 日付が変更された場合は、ログを削除して新しい位置に挿入
    const originalDate = logs[editLogIndex].date;
    const newDate = editLog.date;
    
    if (originalDate !== newDate) {
      // 元のログを削除
      logs.splice(editLogIndex, 1);
      
      // 新しい日付で適切な位置に挿入（日付の降順を維持）
      const newLog = { ...editLog };
      let insertIndex = 0;
      
      // 新しい日付より新しいログの数を数える
      for (let i = 0; i < logs.length; i++) {
        if (logs[i].date > newDate) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      logs.splice(insertIndex, 0, newLog);
    } else {
      // 日付が変更されていない場合は、そのまま更新
      logs[editLogIndex] = { ...editLog };
    }
    
    return logs;
  },
  
  /**
   * ログ削除処理
   * @param {Array} logs - 勤怠ログ配列
   * @param {number} deleteLogIndex - 削除するログのインデックス
   * @returns {Array} 更新されたログ配列
   */
  deleteLog(logs, deleteLogIndex) {
    if (deleteLogIndex === null || deleteLogIndex < 0 || deleteLogIndex >= logs.length) {
      return logs;
    }
    
    // 指定されたインデックスのログを削除
    logs.splice(deleteLogIndex, 1);
    
    return logs;
  }
};
