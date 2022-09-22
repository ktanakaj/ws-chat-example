/**
 * WebSocket上のJSON-RPC2サービスモジュール。
 * @module ./app/core/jsonrpc2.service
 */
import { Injectable, Inject, Optional } from '@angular/core';
import { JsonRpc2Implementer, JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import { SimpleNgWebSocket } from 'simple-ng-websocket';

/**
 * WebSocket上のJSON-RPC2サービスモジュールクラス。
 */
@Injectable()
export class JsonRpc2Service {
	/** メソッドコールのハンドラー */
	methodHandlers: ((method: string, params?: any, id?: number | string) => any)[] = [];

	/** JSON-RPC2実装 */
	private rpc: JsonRpc2Implementer;

	/**
	 * 渡されたWebSocket接続上でのJSON-RPC2での通信用サービスを構築する。
	 * @param ngws WebSocket接続。
	 */
	constructor(private ngws: SimpleNgWebSocket) {
		this.rpc = new JsonRpc2Implementer();
		this.rpc.sender = (message) => ngws.send(message, false);
		ngws.on('message', (ev) => this.rpc.receive(ev.data).catch(console.error));
		this.rpc.methodHandler = (method, params, id) => {
			return this.callMethodHandlers(method, params, id);
		};
		ngws.on('close', (ev) => setTimeout(() => ngws.connect(), 1000));
		ngws.on('error', (ev) => ngws.close());
	}

	/**
	 * JSON-RPC2でリモートプロシージャをコールする。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @returns 戻り値。
	 */
	call(method: string, params?: any): Promise<any> {
		return this.rpc.call(method, params);
	}

	/**
	 * JSON-RPC2でリモートプロシージャを通知を送る。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @returns 処理状態。
	 */
	notice(method: string, params?: any): Promise<void> {
		return this.rpc.notice(method, params);
	}

	/**
	 * メソッドハンドラーを実行する。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @param id ID。
	 * @returns 処理結果。エラーの場合は例外を投げる。
	 */
	protected callMethodHandlers(method, params, id): void {
		// ※ 複数のハンドラーを登録可能だが、最初に実行されたメソッドの結果を返す
		for (let handler of this.methodHandlers) {
			try {
				return handler(method, params, id);
			} catch (e) {
				if (!(e instanceof MethodNotFoundError)) {
					throw e;
				}
			}
		}
		throw new JsonRpcError(ErrorCode.MethodNotFound);
	}
}

/**
 * メソッドなしを示す例外クラス。
 */
export class MethodNotFoundError extends Error {
	/**
	 * 例外を生成する。
	 * @param method メソッド名。
	 */
	constructor(method: string) {
		super(`${method} is not found`);
		this.name = "MethodNotFoundError";
	}
}