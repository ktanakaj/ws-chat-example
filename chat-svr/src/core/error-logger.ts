/**
 * エラーログ出力のモジュール。
 * @module ./core/error-logger
 */
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import * as log4js from 'log4js';
import { ValidationError } from './utils/validation-utils';
import { MethodNotFoundError } from './ws/method-invoker';
const logger = log4js.getLogger('error');

/**
 * エラーロガー。
 * @param err エラー情報。
 */
export default function (err: any): void {
	// エラーの内容によってログ出力を制御する
	// ・バリデーションエラーなどサーバーとしては正常なものはエラーログに出さない
	// ・それ以外のサーバーのエラーや想定外のものはログに出す
	if (err instanceof ValidationError || err instanceof MethodNotFoundError) {
		return logger.debug(err.stack);
	}
	if (err instanceof JsonRpcError) {
		switch (err.code) {
			case ErrorCode.ParseError:
			case ErrorCode.InvalidRequest:
			case ErrorCode.MethodNotFound:
			case ErrorCode.InvalidParams:
				return logger.debug(err.stack);
		}
	}

	logger.error(err);
}
