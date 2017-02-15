/**
 * WebSocketサーバのNode.jsモジュール。
 *
 * このディレクトリは、アプリ固有のロジックを含めない、
 * WebSocketフレームワーク/ライブラリ的なモジュールを配置。
 * @module ./core
 */
import * as WebSocket from 'ws';
import * as config from 'config';
import * as log4js from 'log4js';
import { formatAccessLog } from './ws-connection';
import { WebSocketRpcConnection } from './ws-rpc-connection';
import { MethodHandlerBuilder } from './method-handler-builder';
import errorHandler from './error-handler';
const logger = log4js.getLogger('ws');

// WebSocketサーバを起動
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer(config['websocket']);

// メソッドハンドラーを作成
const mhBuilder = new MethodHandlerBuilder("../ws/");
mhBuilder.errorHandler = (err) => {
	// エラーログだけ出して再スロー
	errorHandler(err);
	throw err;
};
const methodHandler = mhBuilder.toHandler();

// コネクションハンドラーを登録
wss.on('connection', (ws) => {
	const conn = new WebSocketRpcConnection(ws);
	conn.logger = (eventName, body) => wslog(eventName, formatAccessLog(conn, eventName, body));
	conn.methodHandler = methodHandler;
});

// エラーハンドラーを登録
wss.on('error', errorHandler);

// 一応起動したサーバーを返す
export let server = wss;

/**
 * WebSocketログを出力する。
 * @param eventName イベント名。
 * @param log ログ。
 */
function wslog(eventName, log) {
	// ping系はログレベルを下げる
	switch (eventName) {
		case 'SEND PING':
		case 'SEND PONG':
		case 'RECEIVE PING':
		case 'RECEIVE PONG':
			logger.trace(log);
			break;
		default:
			logger.info(log);
			break;
	}
}