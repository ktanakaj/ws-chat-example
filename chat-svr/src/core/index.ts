/**
 * サーバの起動モジュール。
 *
 * このディレクトリには、アプリ全体で共通的な仕組みや設定を記述する。
 * アプリ固有のビジネスロジックは可能な限り含めない。
 * @module ./core
 */
import * as WebSocket from 'ws';
import * as config from 'config';
import * as log4js from 'log4js';
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
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
 * @param methodDir メソッドファイルのディレクトリパス。※相対パスはルートから
 * @returns 起動したサーバーとコネクション用のマップ。
 */
export function createServer(options: WebSocket.IServerOptions, methodDir: string): { wss: WebSocket.Server, connections: WebSocketConnectionMap } {
	const wss = new WebSocketServer(options);

	// メソッドディレクトリの実行インスタンスを作成
	const invoker = new RpcMethodInvoker(methodDir);
	// メソッドエラーのエラーハンドラーを登録
	invoker.errorHandler = rpcMethodErrorHandler;

	// コネクション管理用のマップを作成
	const connections = new WebSocketConnectionMap();

	// コネクションハンドラーを登録
	wss.on('connection', (ws) => {
		const conn = new WebSocketRpcConnection(ws, {
			logger: (level, message) => logger[level](message),
			methodHandler: (method, params, id) => invoker.invoke(method, params, id, conn),
		});
		// 管理用のマップにも登録 ※oncloseで自動削除
		connections.push(conn);
	});

	// WebSocketサーバーのエラーハンドラーを登録
	wss.on('error', errorLogger);

	return {
		wss: wss,
		connections: connections,
	};
}