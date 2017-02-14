/**
 * WebSocketコネクションクラスのモジュール。
 *
 * wsのコネクションを拡張したラッパークラス。
 * @module ./core/ws-connection
 */
import * as WebSocket from 'ws';
import * as Random from 'random-js';
const random = new Random();

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
	messageHandlers: ((message: string, connection: WebSocketConnection) => void)[] = [];
	/** コネクション切断イベントのハンドラー */
	closeHandlers: ((code: number, session: Object) => void)[] = [];
	/** 通信ロガー */
	logger: (log: string) => void = () => console.log;

	/**
	 * WebSocketコネクションインスタンスを生成する。
	 * @param ws 生のWebSocket接続。
	 */
	constructor(ws: WebSocket) {
		this.ws = ws;

		// セッションを開始、アクセスログ用のトラッキングIDを発行
		this.logger(this.formatAccessLog('CONNECTION'));

		// 各イベントごとの処理を登録
		ws.on('close', (code: number, reason: string) => {
			this.logger(this.formatAccessLog('CLOSE', reason));
			for (let handler of this.closeHandlers) {
				handler(code, this.session);
			}
		});

		ws.on('ping', (data: any) => {
			this.logger(this.formatAccessLog('PING', data));
		});

		ws.on('pong', (data: any) => {
			this.logger(this.formatAccessLog('PONG', data));
		});

		ws.on('message', (message: string) => {
			this.logger(this.formatAccessLog('RECEIVE', message));
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
			this.logger(this.formatAccessLog('SEND', message));
		});
	}

	/**
	 * アクセスログを書式化する。
	 * @param eventName イベント名。
	 * @param body イベントデータ。
	 * @returns ログ文字列。
	 */
	protected formatAccessLog(eventName: string, body?: any): string {
		let log = eventName;
		if (body !== undefined && body !== null && body !== '') {
			log += ' ' + body;
		}
		log += ' #' + this.id;
		return log;
	}
}

