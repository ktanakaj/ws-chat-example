/**
 * アクションハンドラーのNode.jsモジュール。
 * @module ./core/action-handler
 */
import * as WebSocket from 'ws';
import * as path from 'path';
import fileUtils from './utils/file-utils';
import errorHandler from './error-handler';
import { JsonRpc2Request, JsonRpcError, ErrorCode } from './json-rpc2';

/** アクションを格納するディレクトリのパス */
const ACTION_DIR = "../actions/";

// アクションディレクトリの全ファイルをメッセージに対応する処理として読み込み
const baseDir = path.join(__dirname, ACTION_DIR);
const actions = new Map<string, Function>();
fileUtils.directoryWalkRecursiveSync(
	baseDir,
	function (realpath) {
		if (/\.[jt]s$/.test(realpath)) {
			actions.set(path.join(realpath.replace(baseDir, "").replace(/\.[jt]s$/, "")), require(realpath));
		}
	});

/**
 * アクションコールイベント。
 * @param request リクエスト情報。
 * @param session セッション情報。
 * @param ws WebSocket
 * @returns 処理結果。
 */
export default function (request: JsonRpc2Request, session: Object, ws: WebSocket): Promise<any> {
	try {
		if (!request.method) {
			throw new JsonRpcError(ErrorCode.MethodNotFound);
		}
		// 読み込み済みのアクションから一致するものを探索
		const action = actions.get(request.method);
		if (!action || typeof (action) !== 'function') {
			throw new JsonRpcError(ErrorCode.MethodNotFound);
		}
		// アクションを実行
		const result = action(request.params, session);
		if (result instanceof Promise) {
			return result.catch(callErrorHandler);
		}
		return Promise.resolve(result);
	} catch (e) {
		// 同期処理用のキャッチ
		return callErrorHandler(e);
	}
};

/**
 * アクションコールのエラーイベントにハンドラーを登録する。
 * @param handler エラーハンドラー。※エラーを揉み消さない場合は再スローすること
 */
export function onError(handler: (err: any) => {}): void {
	actionErrorHandler = handler;
}

/**
 * アクションコールのエラーイベントのハンドラー。
 * @param err エラー情報。
 */
let actionErrorHandler: (err: any) => {} = function (err: any) {
	// 何も登録されていない場合は、デフォルトのエラーハンドラーを呼ぶ
	// エラーは解消されないはずなので再スローする
	errorHandler(err);
	throw err;
};

/**
 * アクションコールのエラーイベントのハンドラーを実行する。
 * @param err エラー情報。
 * @returns 処理結果。
 */
function callErrorHandler(err: any): Promise<any> {
	try {
		actionErrorHandler(err);
		return Promise.resolve(null);
	} catch (e) {
		return Promise.reject(err);
	}
}


