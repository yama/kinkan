/**
 * テンプレートローダーモジュール
 * HTMLテンプレートの動的読み込みと挿入を担当
 */
window.TemplateLoader = {
  /**
   * テンプレートファイルを読み込み
   * @param {string} templatePath - テンプレートファイルのパス
   * @returns {Promise<string>} テンプレートHTML
   * @throws {Error} 読み込みに失敗した場合
   */
  async loadTemplate(templatePath) {
    const response = await fetch(`templates/${templatePath}`);
    if (!response.ok) {
      throw new Error(`テンプレート '${templatePath}' の読み込みに失敗しました (${response.status})`);
    }
    return await response.text();
  },

  /**
   * テンプレートを読み込んで指定要素に挿入
   * @param {string} templatePath - テンプレートファイルのパス
   * @param {HTMLElement} targetElement - 挿入先要素
   * @throws {Error} 要素が見つからない、または読み込みに失敗した場合
   */
  async loadAndInsert(templatePath, targetElement) {
    if (!targetElement) {
      throw new Error(`テンプレート '${templatePath}' の挿入先要素が見つかりません`);
    }
    
    const template = await this.loadTemplate(templatePath);
    targetElement.innerHTML = template;
  },

  /**
   * 複数のテンプレートを並行して読み込み
   * @param {Array} templateConfigs - [{path: string, elementId: string}]の配列
   * @throws {Error} いずれかのテンプレート読み込みに失敗した場合
   */
  async loadMultipleTemplates(templateConfigs) {
    const promises = templateConfigs.map(async (config) => {
      const element = document.getElementById(config.elementId);
      await this.loadAndInsert(config.path, element);
    });
    
    await Promise.all(promises);
  }
};
