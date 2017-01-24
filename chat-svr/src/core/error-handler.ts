/**
 * エラーハンドラーのNode.jsモジュール。
 * @module ./core/error-handlers
 */
import { JsonRpcError, ErrorCode } from './json-rpc2';
import * as log4js from 'log4js';
const logger = log4js.getLogger('error');

/**
 * JSON-RPC2エラーハンドラー。
 * @param err エラー情報。
 * @param next 後続のハンドラーへのcallback。
 */
function handleJsonRpcError(err: any, next: Function): void {
	if (err instanceof JsonRpcError) {
		// 以下のエラーは、不具合ではないのでエラーログは出さない
		switch (err.code) {
			case ErrorCode.ParseError:
			case ErrorCode.InvalidRequest:
			case ErrorCode.MethodNotFound:
			case ErrorCode.InvalidParams:
				return logger.debug(err.stack);
		}
	}
	next(err);
}

/**
 * デフォルトエラーハンドラー。
 * @param err エラー情報。
 * @param next 後続のハンドラーへのcallback。
 */
function handleError(err: any, next: Function): void {
	logger.error(err);
}

// ↓エラーハンドラーを処理順に記述
const handlers = [
	handleJsonRpcError,
	handleError,
];

/**
 * WebSocketエラーハンドラー。
 * @param err エラー情報。
 */
export default function (err: any): void {
	(function next(e, i = 0) {
		if (e === undefined || e === null || !handlers[i]) {
			return;
		}
		handlers[i](e, (e) => next(e, ++i));
	})(err);
};
