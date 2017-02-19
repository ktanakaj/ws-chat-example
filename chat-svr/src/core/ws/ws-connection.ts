/**
 * WebSocketコネクションクラスのモジュール。
 *
 * wsのコネクションを拡張したラッパークラス。
 * @module ./core/ws/ws-connection
 */
import * as WebSocket from 'ws';
import * as Random from 'random-js';
const random = new Random();

/**
 * WebSocketコネクションのオプション引数。
 */
export interface WebSocketConnectionOptions {
	/** メッセージ受信イベントのハンドラー */
	messageHandlers?: ((message: string, connection: WebSocketConnection) => void)[],
	/** コネクション切断イベントのハンドラー */
	closeHandlers?: ((code: number, connection: WebSocketConnection) => void)[],
	/** 通信ロガー */
	logger?: (level: string, message: string) => void,
}

/**
 * WebSocketコネクションクラス。
 */
export class WebSocketConnection {
	/** 生のWebSocket接続 */
	ws: WebSocket;
	/** 一意なコネクションID */
	id: string = generateUniqueId();
	/** 簡易セッション用オブジェクト */
	session: Object = {};

	/** メッセージ受信イベントのハンドラー */
	messageHandlers: ((message: string, connection: WebSocketConnection) => void)[];
	/** コネクション切断イベントのハンドラー */
	closeHandlers: ((code: number, connection: WebSocketConnection) => void)[];
	/** 通信ロガー */
	logger: (level: string, message: string) => void;

	/**
	 * WebSocketコネクションインスタンスを生成する。
	 * @param ws 生のWebSocket接続。
	 * @param options オプション。
	 */
	constructor(ws: WebSocket, options: WebSocketConnectionOptions = {}) {
		this.ws = ws;

		// イベント系はプロパティで登録可能だが、ロガーだけはコンストラクタでも使用するため、
		// オプションでも指定できるようにする
		this.messageHandlers = options.messageHandlers || [];
		this.closeHandlers = options.closeHandlers || [];
		this.logger = options.logger || (() => (level: string, message: string) => console.log(message));

		// 接続開始ログ
		this.logger('info', this.formatAccessLog('CONNECTION'));

		// 各イベントごとの処理を登録
		ws.on('close', (code: number, reason: string) => {
			this.logger('info', this.formatAccessLog('CLOSE', reason));
			for (let handler of this.closeHandlers) {
				handler(code, this);
			}
		});

		ws.on('ping', (data: any) => {
			this.logger('trace', this.formatAccessLog('RECEIVE PING', data));
		});

		ws.on('pong', (data: any) => {
			this.logger('trace', this.formatAccessLog('RECEIVE PONG', data));
		});

		ws.on('message', (message: string) => {
			this.logger('info', this.formatAccessLog('RECEIVE', message));
			for (let handler of this.messageHandlers) {
				handler(message, this);
			}
		});
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
}

/**
 * 一意なIDを生成する。
 * @returns 一意なID。
 */
function generateUniqueId(): string {
	// ユーザーには見せないログや内部処理用のIDの想定
	// 被らなくて見分けやすければいいので、4桁の適当な英字+タイムスタンプ
	// ※ @types の1.0.8現在、何故か引数が逆になっているのでanyで回避
	const r: any = random;
	return r.string(4, 'abcdefghijklmnopqrstuvwxyz') + Date.now();
}
