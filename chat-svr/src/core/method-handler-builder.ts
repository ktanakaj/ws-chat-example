/**
 * WebSocketのJSON-RPC2メソッドハンドラー構築クラスのモジュール。
 * @module ./core/method-handler-builder
 */
import * as path from 'path';
import fileUtils from './utils/file-utils';
import objectUtils from './utils/object-utils';
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import { WebSocketRpcConnection } from './ws-rpc-connection';

/**
 * WebSocketのJSON-RPC2メソッドハンドラー構築クラス。
 */
export class MethodHandlerBuilder {
	/**
	 * メソッドコールエラーイベントのハンドラー。
	 * ※ エラーを解消しない場合は再スローすること
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
		const baseDir = path.join(__dirname, this.methodDir);
		fileUtils.directoryWalkRecursiveSync(
			baseDir,
			(realpath) => {
				if (/\.[jt]s$/.test(realpath)) {
					this.methods.set(path.join(realpath.replace(baseDir, "").replace(/\.[jt]s$/, "")), require(realpath));
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
				const action = self.methods.get(method);
				if (!action || typeof (action) !== 'function') {
					throw new JsonRpcError(ErrorCode.MethodNotFound);
				}
				// メソッドを実行
				const result = action(params, connection);
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



