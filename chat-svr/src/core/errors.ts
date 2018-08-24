/**
 * アプリケーションエラーの例外モジュール。
 * @module ./core/errors
 */
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';

/**
 * サーバーエラーを示す例外クラス。
 */
export class InternalServerError extends JsonRpcError {
	/** 元になったエラーがある場合その情報 */
	cause: any;

	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 * @param cause 元になったエラーがある場合その情報。
	 */
	constructor(message: string, cause?: any) {
		// TODO: エラーコードは現状適当
		super(-1, message);
		this.name = this.constructor.name;
		this.cause = cause;
	}
}

/**
 * 引き数誤りを示す例外クラス。
 */
export class BadRequestError extends JsonRpcError {
	/** 元になったエラーがある場合その情報 */
	cause: any;

	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 * @param cause 元になったエラーがある場合その情報。
	 */
	constructor(message: string, cause?: any) {
		super(ErrorCode.InvalidParams, message);
		this.name = this.constructor.name;
		this.cause = cause;
	}
}
