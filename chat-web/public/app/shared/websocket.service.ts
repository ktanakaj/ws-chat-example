/**
 * WebSocketサービスモジュール。
 *
 * ほぼangular2-websocketの簡略版。
 * あちらを使いたかったけど、0.90現在バグ？で動かないので独自に必要部分だけ実装。
 * @module ./app/shared/websocket.service
 */
import { Injectable, Inject, Optional, OpaqueToken } from '@angular/core';

/**
 * 接続先URLのDIキー。
 */
export const CONNECT_URL = new OpaqueToken('connectUrl');

/**
 * WebSocketサービスモジュールクラス。
 */
@Injectable()
export class WebSocketService {
	// 接続先URL
	protected url;
	// WebSocketコネクション
	protected ws: WebSocket;

	// WebSocket送信データのキュー
	private queue = [];

	// openイベント用のハンドラー
	private onOpenHandlers: Function[] = [];
	// closeイベント用のハンドラー
	private onCloseHandlers: Function[] = [];
	// messageイベント用のハンドラー
	private onMessageHandlers: Function[] = [];
	// errorイベント用のハンドラー
	private onErrorHandlers: Function[] = [];

	/**
	 * 設定をDIしてコンポーネントを生成する。
	 * @param url 接続先URL。
	 */
	constructor( @Inject(CONNECT_URL) @Optional() url?: string) {
		// URLが渡されなかった場合は、自分のサーバーに接続
		if (!url) {
			url = 'ws';
			if (window.location.protocol === 'https:') {
				url += 's';
			}
			url += '://' + window.location.host + '/';
		}
		this.url = url;
		this.connect();
	}

	/**
	 * WebSocket接続を開始する。
	 */
	connect(): void {
		// 接続と同時に各種イベントのハンドラーを登録
		this.ws = new WebSocket(this.url);
		this.ws.onopen = (ev) => {
			console.log(`OPEN`);
			this.fireQueue();
			this.callHandlers(this.onOpenHandlers, ev);
		}
		this.ws.onclose = (ev) => {
			console.log(`CLOSE ${ev.reason}`);
			this.callHandlers(this.onCloseHandlers, ev);
		};
		this.ws.onmessage = (ev) => {
			console.log(`RECEIVE ${ev.data}`);
			this.callHandlers(this.onMessageHandlers, ev);
		};
		this.ws.onerror = (ev) => {
			console.log(`ERROR ${ev.message}`);
			this.callHandlers(this.onErrorHandlers, ev);
		};
	}

	/**
	 * メッセージを送信する。
	 * @param message メッセージ。
	 * @param toJson JSONエンコードする場合true。デフォルトtrue。
	 */
	send(message: any, toJson: boolean = true): void {
		if (toJson) {
			message = JSON.stringify(message);
		}
		this.queue.push(message);
		if (this.ws.readyState === WebSocket.OPEN) {
			this.fireQueue();
		} else if (this.ws.readyState !== WebSocket.CONNECTING) {
			this.connect();
		}
	}

	/**
	 * openイベントのハンドラーを登録する。
	 * @param handler ハンドラー。
	 */
	onOpen(handler: (this: WebSocket, ev: Event) => any): void {
		this.onOpenHandlers.push(handler);
	}

	/**
	 * closeイベントのハンドラーを登録する。
	 * @param handler ハンドラー。
	 */
	onClose(handler: (this: WebSocket, ev: CloseEvent) => any): void {
		this.onCloseHandlers.push(handler);
	}

	/**
	 * messageイベントのハンドラーを登録する。
	 * @param handler ハンドラー。
	 */
	onMessage(handler: (this: WebSocket, ev: MessageEvent) => any): void {
		this.onMessageHandlers.push(handler);
	}

	/**
	 * errorイベントのハンドラーを登録する。
	 * @param handler ハンドラー。
	 */
	onError(handler: (this: WebSocket, ev: ErrorEvent) => any): void {
		this.onErrorHandlers.push(handler);
	}

	/**
	 * キューに格納されているメッセージを送信する。
	 */
	private fireQueue(): void {
		while (this.queue.length > 0) {
			const message = this.queue.shift();
			console.log(`SEND ${message}`);
			this.ws.send(message);
		}
	}

	/**
	 * 登録されているイベントハンドラーをコールする。
	 */
	private callHandlers(handlers: Function[], ev: Event): void {
		for (let handler of handlers) {
			handler.apply(this.ws, [ev]);
		}
	}
}
