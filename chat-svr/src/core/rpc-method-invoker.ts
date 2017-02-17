/**
 * RPCに対応するメソッドディレクトリのソースを実行するクラスのモジュール。
 * @module ./core/rpc-method-invoker
 */
import * as path from 'path';
import * as S from 'string';
import fileUtils from './utils/file-utils';
import objectUtils from './utils/object-utils';
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import { WebSocketRpcConnection } from './ws-rpc-connection';

/**
 * RPCに対応するメソッドディレクトリのソースを実行するクラス。
 */
export class RpcMethodInvoker {
	/**
	 * メソッドコールエラーイベントのハンドラー。
	 * ※ エラーを解消しない場合は再スローすること。デフォルトは再スローのみ。
	 */
	errorHandler: (err: any) => void = (err) => { throw err };

	/** メソッド本体のディレクトリ */
	protected methodDir: string;
	/** 読み込んだメソッド */
	protected methods = new Map<string, Function>();

	/**
	 * 指定されたディレクトリのメソッドを呼び出すハンドラーのビルダーを生成する。
	 * @param methodDir メソッドファイルのディレクトリパス。
	 */
	constructor(methodDir: string) {
		this.methodDir = methodDir;

		// メソッドディレクトリの全ファイルをメッセージに対応する処理として読み込み
		// ※ ファイル名をメソッド名とみなす。ファイル名はキャメルケースに変換する
		const baseDir = path.join(__dirname, this.methodDir);
		fileUtils.directoryWalkRecursiveSync(
			baseDir,
			(realpath) => {
				if (/\.[jt]s$/.test(realpath)) {
					this.methods.set(S(realpath.replace(baseDir, "").replace(/\.[jt]s$/, "")).camelize().s, require(realpath));
				}
			});
	}

	/**
	 * メソッドハンドラーを生成する。
	 * @returns 生成したハンドラー。
	 */
	toHandler() {
		const self = this;
		return function (method: string, params: any, id: number | string, connection: WebSocketRpcConnection): Promise<any> {
			try {
				if (!method) {
					throw new JsonRpcError(ErrorCode.MethodNotFound);
				}
				// 読み込み済みのメソッドから一致するものを探索
				const m = self.methods.get(method);
				if (!m || typeof m !== 'function') {
					throw new JsonRpcError(ErrorCode.MethodNotFound);
				}

				// メソッドを実行する
				const result = doMethod(m, params, id, connection);
				if (objectUtils.isPromise(result)) {
					return result.catch((e) => self.callErrorHandler(e));
				}
				return Promise.resolve(result);
			} catch (e) {
				// 同期処理用のキャッチ
				return self.callErrorHandler(e);
			}
		};
	}

	/**
	 * メソッドコールのエラーイベントのハンドラーを実行する。
	 * @param err エラー情報。
	 * @returns 処理結果。
	 */
	protected callErrorHandler(err: any): Promise<any> {
		try {
			// ※ エラーを解消しない場合は再スローされる想定
			this.errorHandler(err);
			return Promise.resolve(null);
		} catch (e) {
			return Promise.reject(err);
		}
	}
}

/**
 * メソッドコードを実行する。
 *
 * メソッドコードは、通常の関数、もしくは method というメソッドを持ったクラスであること。
 * メソッドクラスの場合、引数以外に id, session, connection がプロパティとして使用可能。
 * @param method 実行する関数もしくはメソッドクラス。
 * @param params 関数の引数。
 * @param id RPCのID。
 * @param connection WebSocket/RPCコネクション。
 */
function doMethod(method: any, params: any, id: number | string, connection: WebSocketRpcConnection) {
	// もしファンクションがmethodという関数をもつ場合は、メソッドクラスとしてnewして実行する
	if (!method.prototype.method || typeof method.prototype.method !== 'function') {
		return method(params);
	}

	// サブ的な情報はプロパティとして渡す
	const action = new method();
	action.id = id;
	action.connection = connection;
	action.session = connection.session;
	return action.method(params);
}