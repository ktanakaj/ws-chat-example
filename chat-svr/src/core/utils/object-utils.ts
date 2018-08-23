/**
 * オブジェクト関連ユーティリティモジュール。
 * @module ./core/utils/object-utils
 */

/**
 * 渡された関数を非同期処理で実行する。
 * @param func 実行する関数。
 * @returns Promiseでラップした戻り値。
 */
function invokeAsPromise<T>(func: Function): Promise<T> {
	try {
		return Promise.resolve(func());
	} catch (e) {
		return Promise.reject(e);
	}
}

export default {
	invokeAsPromise,
};
