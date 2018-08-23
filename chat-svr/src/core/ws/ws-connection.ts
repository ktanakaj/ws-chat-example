/**
 * WebSocketコネクションクラスのモジュール。
 *
 * wsのコネクションを拡張したラッパークラス。
 * @module ./core/ws/ws-connection
 */
import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import * as Random from 'random-js';
const random = new Random();

/**
 * WebSocketコネクションのオプション引数。
 */
export interface WebSocketConnectionOptions {
	/** 通信ロガー */
	logger?: (level: string, message: string) => void;
	/** Pingでコネクション維持を行う場合その間隔 (ms) */
	keepAliveTime?: number;
}

/**
 * WebSocketコネクションクラス。
 */
export class WebSocketConnection extends EventEmitter {
	/** 生のWebSocket接続 */
	ws: WebSocket;
	/** 一意なコネクションID */
	public id: string = this.generateUniqueId();
	/** 簡易セッション用オブジェクト */
	public session: Object = this.makeSessionObject();

	/** 通信ロガー */
	public logger = (level: string, message: string) => console.log(message);

	/**
	 * WebSocketコネクションインスタンスを生成する。
	 * @param ws 生のWebSocket接続。
	 * @param options オプション。
	 */
	constructor(ws: WebSocket, options: WebSocketConnectionOptions = {}) {
		super();
		this.ws = ws;

		// イベント系はプロパティで登録可能だが、ロガーだけはコンストラクタでも使用するため、
		// オプションでも指定できるようにする
		if (options.logger) {
			this.logger = options.logger;
		}

		// 接続開始ログ
		this.logger('info', this.formatAccessLog('CONNECTION'));

		// 各イベントごとの処理を登録
		ws.on('close', (code: number, reason: string) => {
			this.logger('info', this.formatAccessLog('CLOSE', reason));
			this.emit('close', code, this);
		});

		ws.on('error', (err) => {
			this.logger('error', this.formatAccessLog('ERROR', err));
			this.emit('error', err, this);
		});

		ws.on('ping', (data: any) => {
			this.logger('trace', this.formatAccessLog('RECEIVE PING', data));
		});

		ws.on('pong', (data: any) => {
			this.logger('trace', this.formatAccessLog('RECEIVE PONG', data));
		});

		ws.on('message', (message: string) => {
			this.logger('info', this.formatAccessLog('RECEIVE', message));
			this.emit('message', message, this);
		});

		// 死活監視を開始する
		if (options.keepAliveTime > 0) {
			this.startKeepAlive(options.keepAliveTime);
		}
	}

	/**
	 * メッセージを送信する。
	 * @param data 送信するデータ。
	 * @param toJson JSONに変換する場合true。デフォルトtrue。
	 * @return 処理状態。
	 */
	send(data: any, toJson: boolean = true): Promise<void> {
		let message = data;
		if (toJson) {
			message = JSON.stringify(data);
		}
		return new Promise<void>((resolve, reject) => {
			this.ws.send(message, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
			this.logger('info', this.formatAccessLog('SEND', message));
		});
	}

	/**
	 * 死活監視を開始する。
	 * @param keepAliveTime 監視間隔 (ms)。0は監視無効。
	 */
	startKeepAlive(keepAliveTime: number): void {
		// コネクション維持を行う場合、一定間隔でpingを送信する
		// ※ JavaScriptのクライアントAPIはpingを自分から送信できないのでサーバー側から送る
		const self = this;
		function keepAlive() {
			if (self.ws.readyState === WebSocket.OPEN) {
				self.ping();
				setTimeout(keepAlive, keepAliveTime);
			}
		}
		setTimeout(keepAlive, keepAliveTime);
	}

	/**
	 * PINGを送信する。
	 */
	ping(): void {
		this.ws.ping();
		this.logger('trace', this.formatAccessLog('SEND PING'));
	}

	/**
	 * 一意なIDを生成する。
	 * @returns 一意なID。
	 */
	protected generateUniqueId(): string {
		// ユーザーには見せないログや内部処理用のIDの想定
		// 被らなくて見分けやすければいいので、4桁の適当な英字+タイムスタンプ
		return random.string(4, 'abcdefghijklmnopqrstuvwxyz') + Date.now();
	}

	/**
	 * 簡易セッション用のオブジェクトを生成する。
	 * @returns セッション用オブジェクト。
	 */
	protected makeSessionObject(): Object {
		// 値が変更されたらイベントととして通知するオブジェクトを生成
		const self = this;
		return new Proxy({}, {
			set(target, name: PropertyKey, value: any): boolean {
				const old = target[name];
				target[name] = value;
				self.emit('sessionUpdated', name, old, value);
				return true;
			},
			deleteProperty(target, name: PropertyKey): boolean {
				const old = target[name];
				delete target[name];
				self.emit('sessionUpdated', name, old, null);
				return true;
			}
		});
	}

	/**
	 * アクセスログを書式化する。
	 * @param eventName イベント名。
	 * @param body イベントデータ。
	 * @returns ログ文字列。
	 */
	formatAccessLog(eventName: string, body?: any): string {
		let log = eventName;
		if (body !== undefined && body !== null && body !== '') {
			log += ' ' + body;
		}
		log += ' #' + this.id;
		return log;
	}

	// イベント定義
	emit(event: 'message', message: string, connection: WebSocketConnection): boolean;
	emit(event: 'close', code: number, connection: WebSocketConnection): boolean;
	emit(event: 'error', err: Error, connection: WebSocketConnection): boolean;
	emit(event: 'sessionUpdated', name: PropertyKey, oldValue: any, newValue: any): boolean;
	emit(event: string | symbol, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}
	on(event: 'message', listener: (message: string, connection: WebSocketConnection) => void): this;
	on(event: 'close', listener: (code: number, connection: WebSocketConnection) => void): this;
	on(event: 'error', listener: (err: Error, connection: WebSocketConnection) => void): this;
	on(event: 'sessionUpdated', listener: (name: PropertyKey, oldValue: any, newValue: any) => void): this;
	on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}
	once(event: 'message', listener: (message: string, connection: WebSocketConnection) => void): this;
	once(event: 'close', listener: (code: number, connection: WebSocketConnection) => void): this;
	once(event: 'error', listener: (err: Error, connection: WebSocketConnection) => void): this;
	once(event: 'sessionUpdated', listener: (name: PropertyKey, oldValue: any, newValue: any) => void): this;
	once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}
	removeListener(event: 'message', listener: (message: string, connection: WebSocketConnection) => void): this;
	removeListener(event: 'close', listener: (code: number, connection: WebSocketConnection) => void): this;
	removeListener(event: 'error', listener: (err: Error, connection: WebSocketConnection) => void): this;
	removeListener(event: 'sessionUpdated', listener: (name: PropertyKey, oldValue: any, newValue: any) => void): this;
	removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.removeListener(event, listener);
	}
}
