/**
 * ブラウザ関連のヘルパーモジュール。
 *
 * @module ./app/core/browser-helper
 */

/**
 * ブラウザのロケールを取得する。
 *
 * @returns ロケールコード。
 */
const getLocale = (): string => {
  // 取得失敗時はデフォルトとしてアメリカを返す
  try {
    return navigator.language;
  } catch (e) {
    return 'en-US';
  }
};

/**
 * ページの言語設定を取得する。
 *
 * @returns 2文字の言語コード。
 */
const getLanguage = (): string => {
  return getLocale().substr(0, 2);
};

/**
 * ページをリダイレクトする。
 *
 * @param url URL。
 */
const redirect = (url: string): void => {
  // ※ ブラウザの素のリダイレクト。Angularのルートは呼ばれない
  window.location.href = url;
};

/**
 * ページを再読み込みする。
 */
const reload = (): void => {
  // ※ ブラウザの素の再読み込み。Angular2のルートは呼ばれない
  window.location.reload();
};

export default {
  getLocale,
  getLanguage,
  redirect,
  reload,
};
