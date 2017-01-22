/**
 * WebSocketコネクションハンドラーのNode.jsモジュール。
 * @module ./core/connection-handler
 */
import * as WebSocket from 'ws';
import * as log4js from 'log4js';
import * as Random from 'random-js';
import errorHandler from './error-handler';
import actionHandler from './action-handler';
import * as jsonRpc2 from './json-rpc2';
const logger = log4js.getLogger('access');
const random = new Random();

/**
 * 一意なセッションIDを生成する。
 * @returns セッションID。
 */
function generateSessionId(): string {
	// ユーザーには見せないログや内部処理用のIDの想定
	// 被らなくて見分けやすければいいので、4桁の適当な英字+タイムスタンプ
	// ※ @types の1.0.8現在、何故か引数が逆になっているのでanyで回避
	const r: any = random;
	return r.string(4, 'abcdefghijklmnopqrstuvwxyz') + Date.now();
}

/**
 * WebSocket接続イベント。
 * @param ws WebSocket
 */
export default function (ws: WebSocket): void {
	// セッションを開始、アクセスログ用のトラッキングIDを発行
	const session = { id: generateSessionId() };
	logger.info(formatAccessLog('CONNECTION'));

	// 各イベントごとの処理を登録
	ws.on('close', function (code: number, reason: string) {
		logger.info(formatAccessLog('CLOSE', reason));
	});

	ws.on('ping', function (data: any) {
		logger.trace(formatAccessLog('PING', data));
	});

	ws.on('pong', function (data: any) {
		logger.trace(formatAccessLog('PONG', data));
	});

	ws.on('message', async function (message: string) {
		// JSON-RPC2形式の引数を想定
		logger.info(formatAccessLog('RECEIVE', message));
		let req;
		try {
			req = jsonRpc2.parseRequest(message);
		} catch (e) {
			send(jsonRpc2.createResponse(null, null, e));
			return errorHandler(e);
		}
		if (!Array.isArray(req)) {
			// 通常のリクエスト
			const res = await doAction(req);
			if (res) {
				send(res);
			}
		} else {
			// バッチリクエスト
			const responses = [];
			for (let r of req) {
				const res = await doAction(r);
				if (res) {
					responses.push(res);
				}
			}
			if (responses.length > 0) {
				send(responses);
			}
		}
	});

	/**
	 * アクションハンドラーを実行する。
	 * @param request リクエスト情報。
	 * @returns レスポンス情報。
	 */
	async function doAction(request: jsonRpc2.JsonRpc2Request): Promise<jsonRpc2.JsonRpc2Response> {
		// アクションハンドラーをコールして、その結果をJSON-RPC2のレスポンスにする
		try {
			const result = await actionHandler(request, session, ws);
			// ID無しは応答不要なので、IDがある場合のみレスポンスを返す
			if (request.id !== undefined && request.id !== null) {
				return jsonRpc2.createResponse(request.id, result);
			}
		} catch (e) {
			// エラー時はリクエストIDの有無にかかわらず返す
			return jsonRpc2.createResponse(request.id, null, e);
		}
		return null;
	}

	/**
	 * メッセージを送信する。
	 * @param data 送信するデータ。
	 */
	function send(data: any): void {
		const message = JSON.stringify(data);
		ws.send(message, errorHandler);
		logger.info(`SEND ${message}`);
	}

	/**
	 * アクセスログを書式化する。
	 * @param eventName イベント名。
	 * @param body イベントデータ。
	 * @returns ログ文字列。
	 */
	function formatAccessLog(eventName: string, body?: any): string {
		let log = eventName;
		if (body !== undefined && body !== null && body !== '') {
			log += ' ' + body;
		}
		log += ' #' + session.id;
		return log;
	}
};
