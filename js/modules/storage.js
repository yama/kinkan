/**
 * ローカルストレージ管理モジュール
 * 勤怠データとユーザー情報の保存・読み込みを担当
 */
window.StorageManager = {
  /**
   * 勤怠データを保存
   * @param {Object} data - 保存するデータ
   */
  saveAttendanceData(data) {
    const attendanceData = {
      logs: data.logs,
      hasClockedIn: data.hasClockedIn,
      lastAction: data.lastAction
    };
    localStorage.setItem(window.AppConfig.STORAGE_KEYS.ATTENDANCE_DATA, JSON.stringify(attendanceData));
  },

  /**
   * 勤怠データを読み込み
   * @returns {Object|null} 勤怠データまたはnull
   */
  loadAttendanceData() {
    const savedData = localStorage.getItem(window.AppConfig.STORAGE_KEYS.ATTENDANCE_DATA);
    return savedData ? JSON.parse(savedData) : null;
  },

  /**
   * ユーザー名を保存
   * @param {string} userName - ユーザー名
   */
  saveUserName(userName) {
    localStorage.setItem(window.AppConfig.STORAGE_KEYS.USER_NAME, userName);
  },

  /**
   * ユーザー名を読み込み
   * @returns {string|null} ユーザー名またはnull
   */
  loadUserName() {
    return localStorage.getItem(window.AppConfig.STORAGE_KEYS.USER_NAME);
  }
};
