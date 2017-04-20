/**
 * サーバの起動モジュール。
 *
 * このディレクトリには、アプリ全体で共通的な仕組みや設定を記述する。
 * アプリ固有のビジネスロジックは可能な限り含めない。
 * @module ./core
 */
import * as path from 'path';
import * as WebSocket from 'ws';
import * as config from 'config';
import * as log4js from 'log4js';
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import fileUtils from './utils/file-utils';
import { ValidationError } from './utils/validation-utils';
import { WebSocketRpcConnection } from './ws/ws-rpc-connection';
import { RpcMethodInvoker } from './ws/rpc-method-invoker';
import { WebSocketConnectionMap } from './ws/ws-connection-map';
import errorLogger from './error-logger';
import rpcMethodErrorHandler from './rpc-method-error-handler';
const logger = log4js.getLogger('ws');
const WebSocketServer = WebSocket.Server;

/**
 * WebSocketサーバを作成する。
 * @param options サーバーの起動オプション。
 * @param methodDir メソッドディレクトリのパス。※相対パスはルートから
 */
export function createServer(options: WebSocket.IServerOptions, methodDir: string): void {
	const wss = new WebSocketServer(options);

	// メソッドディレクトリの実行インスタンスを作成
	const invoker = new RpcMethodInvoker(path.join(methodDir, 'recv'));
	// メソッドエラーのエラーハンドラーを登録
	invoker.errorHandler = rpcMethodErrorHandler;

	// コネクション管理用のマップを作成
	const connections = new WebSocketConnectionMap();

	// コネクションハンドラーを登録
	wss.on('connection', (ws) => {
		const conn = new WebSocketRpcConnection(ws, {
			logger: (level, message) => logger[level](message),
			keepAliveTime: config['keepAliveTime'],
			methodHandler: (method, params, id) => invoker.invoke(method, params, id, conn),
		});
		// 管理用のマップにも登録 ※oncloseで自動削除
		connections.push(conn);
	});

	// WebSocketサーバーのエラーハンドラーを登録
	wss.on('error', errorLogger);

	// 送信メソッドディレクトリの初期化処理を呼び出し
	const senders = fileUtils.requireDirectoriesRecursiveSync(path.join(methodDir, 'send'));
	for (let p in senders) {
		const sender = new senders[p];
		sender['connections'] = connections;
		sender['init']();
	}
}