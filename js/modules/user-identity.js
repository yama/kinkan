/**
 * ユーザー識別子管理モジュール
 * 一時ユーザーIDの生成・クッキー管理を担当
 */
window.UserIdentity = {
  /**
   * クッキーを設定
   * @param {string} name - クッキー名
   * @param {string} value - クッキー値
   * @param {number} days - 有効期限（日数）
   */
  setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  },

  /**
   * クッキーを取得
   * @param {string} name - クッキー名
   * @returns {string|null} クッキー値またはnull
   */
  getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * クッキーを削除
   * @param {string} name - クッキー名
   */
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Strict`;
  },

  /**
   * 一時ユーザー識別子を生成
   * @returns {string} UUID v4形式の識別子
   */
  generateTemporaryUserId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * 一時ユーザー識別子を取得（なければ生成）
   * @returns {string} 一時ユーザー識別子
   */
  getOrCreateTemporaryUserId() {
    let tempUserId = this.getCookie(window.AppConfig.STORAGE_KEYS.TEMP_USER_ID);
    
    if (!tempUserId) {
      tempUserId = this.generateTemporaryUserId();
      this.setCookie(window.AppConfig.STORAGE_KEYS.TEMP_USER_ID, tempUserId);
      console.log('新しい一時ユーザーIDを生成しました:', tempUserId);
    }
    
    return tempUserId;
  }
};
