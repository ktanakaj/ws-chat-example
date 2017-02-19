/**
 * RPCメソッド実行のエラーハンドラーのモジュール。
 * @module ./core/rpc-method-error-handlers
 */
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import objectUtils from './utils/object-utils';
import { ValidationError } from './utils/validation-utils';
import { RpcInvokedEvent } from './ws/rpc-method-invoker';
import errorLogger from './error-logger';

// ※ 以下、エラーを解消しない場合は例外を投げること

/**
 * バリデーションNGエラーハンドラー。
 * @param err エラー情報。
 */
function handleValidationError(err: any): never {
	// バリデーションエラーの場合、JSON-RPCのパラメータエラーに変換
	if (err instanceof ValidationError) {
		throw new JsonRpcError(ErrorCode.InvalidParams);
	}
	throw err;
}

/**
 * デフォルトエラーハンドラー。
 * @param err エラー情報。
 */
function handleError(err: any): never {
	// ログだけ出力してエラー自体はそのまま返す
	errorLogger(err);
	throw err;
}

/**
 * RPCメソッド実行エラーハンドラー。
 *
 * ※ エラーが解消しない場合は、再度例外を投げる。
 * @param err エラー情報。
 * @param event RPCメソッド実行イベント情報。
 * @return 処理結果。
 */
export default function (err: any, event?: RpcInvokedEvent): any {
	// エラーハンドラーを順番に実行する
	const handlers: ((err: any, event?: RpcInvokedEvent) => any)[] = [
		handleValidationError,
		handleError,
	];

	return (function next(e, i = 0) {
		if (!handlers[i]) {
			throw e;
		}
		try {
			const result = handlers[i](e, event);
			if (objectUtils.isPromise(result)) {
				return result.catch((newErr) => next(newErr, ++i));
			}
			return result;
		} catch (newErr) {
			return next(newErr, ++i);
		}
	})(err);
};
