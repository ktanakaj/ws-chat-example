/**
 * アプリケーション汎用エラーの例外クラスモジュール。
 * @module ./core/app-error
 */

import { JsonRpcError } from './core/json-rpc2';

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
		this.name = "AppError";
	}
}
