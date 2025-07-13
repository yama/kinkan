/**
 * ユーザー管理モジュール
 * 一時ユーザーの作成・管理を担当
 */
window.UserManager = {
  /**
   * 初回アクセス時の一時ユーザー初期化
   * クッキーがない場合は一時ユーザーを作成
   * @returns {Promise<boolean>} 初期化成功時はtrue
   */
  async initializeTemporaryUser() {
    try {
      // 既存のユーザーIDをチェック（将来はサーバーから取得）
      // TODO: フェーズ2でサーバーからユーザー情報を取得
      const existingUserId = null; // 現在は常にnull（一時ユーザーのみ）
      if (existingUserId) {
        console.log('既存ユーザーIDが見つかりました:', existingUserId);
        return true;
      }

      // クッキーから一時ユーザー識別子を取得または生成
      const tempUserId = window.UserIdentity.getOrCreateTemporaryUserId();
      
      // 既存の一時ユーザーIDがある場合はそれを使用
      if (existingUserId) {
        return true;
      }

      // サーバーに一時ユーザー作成リクエストを送信
      const response = await this.createTemporaryUserOnServer(tempUserId);
      
      if (response.success) {
        // サーバーから返されたuser_idを保存（将来の実装）
        // TODO: フェーズ2でサーバー状態管理を実装
        console.log('一時ユーザーが作成されました:', response.data);
        return true;
      } else {
        console.error('一時ユーザー作成に失敗しました:', response.error);
        return false;
      }
    } catch (error) {
      console.error('一時ユーザー初期化エラー:', error);
      // サーバーエラーの場合はローカルモードで動作
      return this.initializeLocalMode();
    }
  },

  /**
   * サーバーに一時ユーザー作成リクエストを送信
   * @param {string} identifier - 一時ユーザー識別子
   * @returns {Promise<Object>} レスポンス
   */
  async createTemporaryUserOnServer(identifier) {
    const url = window.AppConfig.API.BASE_URL + window.AppConfig.API.ENDPOINTS.CREATE_TEMPORARY_USER;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        identifier: identifier,
        display_name: null // 初回は匿名
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * ローカルモードでの初期化（サーバーエラー時のフォールバック）
   * @returns {boolean} 常にtrue
   */
  initializeLocalMode() {
    console.warn('ローカルモードで動作します（サーバー接続不可）');
    
    // フェーズ1では一時ユーザーIDのみ管理（ローカルストレージ不使用）
    console.log('一時ユーザーIDでローカル動作を開始します');
    
    return true;
  },

  /**
   * ユーザー名を更新
   * @param {string} displayName - 表示名
   * @returns {Promise<boolean>} 更新成功時はtrue
   */
  async updateDisplayName(displayName) {
    try {
      // サーバーに送信（将来の実装）
      // TODO: フェーズ2でサーバー連携実装
      console.log('ユーザー名を更新:', displayName);
      
      return true;
    } catch (error) {
      console.error('ユーザー名更新エラー:', error);
      return false;
    }
  },

  /**
   * 現在のユーザー情報を取得
   * @returns {Object} ユーザー情報
   */
  getCurrentUserInfo() {
    return {
      userId: null, // フェーズ1では管理しない
      displayName: null, // フェーズ1では管理しない
      tempUserId: window.UserIdentity.getCookie(window.AppConfig.STORAGE_KEYS.TEMP_USER_ID),
      isTemporary: true // フェーズ1では全て一時ユーザー
    };
  },

  /**
   * 一時ユーザーから正規ユーザーへの移行処理（フェーズ2で実装予定）
   * @param {Object} userData - 正規ユーザーデータ
   * @returns {Promise<boolean>} 移行成功時はtrue
   */
  async upgradeToRegularUser(userData) {
    try {
      // 1. 一時ユーザークッキーを削除
      window.UserIdentity.deleteCookie(window.AppConfig.STORAGE_KEYS.TEMP_USER_ID);
      
      // 2. 正規ユーザー情報をサーバーに保存（フェーズ2で実装）
      // TODO: サーバー状態管理の実装
      
      // 3. セッション認証への移行（フェーズ2で実装）
      // TODO: セッション管理の実装
      
      console.log('正規ユーザーへの移行が完了しました:', userData);
      return true;
    } catch (error) {
      console.error('正規ユーザー移行エラー:', error);
      return false;
    }
  }
};
