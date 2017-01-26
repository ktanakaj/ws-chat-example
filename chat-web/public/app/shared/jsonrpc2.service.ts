/**
 * JSON-RPC2形式のWebSocketサービスモジュール。
 * @module ./app/shared/jsonrpc2.service
 */
import { Injectable, Inject, Optional } from '@angular/core';
import { WebSocketService, CONNECT_URL } from './websocket.service';

/**
 * JSON-RPC2形式のWebSocketサービスモジュールクラス。
 */
@Injectable()
export class JsonRpc2Service extends WebSocketService {
	// JSON-RPC2用ID採番元
	private id = 0;
	// callProcedureのPromise用マップ
	private callbackMap: Map<number, { resolve: Function, reject: Function }> = new Map();

	/**
	 * JSON-RPC2形式でデータをやり取りするWebSocket接続を構築する。
	 */
	constructor( @Inject(CONNECT_URL) @Optional() url?: string) {
		super(url);
		// ※ thisが置き換えられるとエラーになるのでアロー演算子で呼び出し
		this.onMessage((ev) => this.receiveResult(ev));
	}

	/**
	 * JSON-RPC2でリモートプロシージャをコールする。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @returns 戻り値。
	 */
	callProcedure(method: string, params?: any): Promise<any> {
		// リクエストを送信するとともに、結果受け取り用のコールバックをマップに保存する
		return new Promise((resolve, reject) => {
			const id = ++this.id;
			this.callbackMap.set(id, { resolve: resolve, reject: reject });
			try {
				this.send({ jsonrpc: '2.0', method: method, params: params, id: id });
			} catch (e) {
				this.callbackMap.delete(id);
				reject(e);
			}
		});
	}

	/**
	 * JSON-RPC2のリモートプロシージャからの結果を受け取る。
	 * @param ev メッセージ。
	 */
	receiveResult(ev: MessageEvent): void {
		// IDがない場合は正常も異常もどうしようもないので無視する
		if (!ev.data) {
			return;
		}
		const res = JSON.parse(ev.data);
		if (!res.id) {
			return;
		}
		// 該当IDのコールバックを実行する
		const cb = this.callbackMap.get(res.id);
		if (!cb) {
			return;
		}
		this.callbackMap.delete(res.id);
		if (res.error) {
			cb.reject(res.error);
		} else {
			cb.resolve(res.result);
		}
	}
}
