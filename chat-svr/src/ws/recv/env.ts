/**
 * システム設定メソッドのモジュール。
 * @module ./ws/recv/env
 */
const packagejson = require('../../../package.json');

/**
 * 環境変数情報を取得する。
 * @return 環境変数情報。
 */
export default function () {
	// API利用側でも参照したい設定情報を返す
	return {
		environment: process.env.NODE_ENV,
		version: packagejson['version'],
	};
}
