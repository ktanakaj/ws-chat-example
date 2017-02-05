/**
 * アプリケーション汎用エラーの例外クラスモジュール。
 * @module ./app-error
 */

import { JsonRpcError } from 'json-rpc2-implementer';

/**
 * アプリケーションエラーとしてエラーコードを返すエラーの例外クラス。
 */
export class AppError extends JsonRpcError {
	/**
	 * 例外を生成する。
	 * @param code エラーコード。
	 * @param message 例外エラーメッセージ。
	 * @param data 例外追加情報。
	 */
	constructor(code?: number, message?: string, data?: any) {
		super(code, message, data);
		// this.name = "AppError";
	}
}
