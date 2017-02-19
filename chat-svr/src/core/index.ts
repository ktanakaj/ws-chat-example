/**
 * WebSocketサーバのNode.jsモジュール。
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
import errorLogger from './error-logger';
import rpcMethodErrorHandler from './rpc-method-error-handler';
const logger = log4js.getLogger('ws');

// WebSocketサーバを起動
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer(config['websocket']);

// メソッドディレクトリの実行インスタンスを作成
const invoker = new RpcMethodInvoker("lib/ws");
// メソッドエラーのエラーハンドラーを登録
invoker.errorHandler = rpcMethodErrorHandler;

// コネクションハンドラーを登録
wss.on('connection', (ws) => {
	const conn = new WebSocketRpcConnection(ws, {
		logger: (level, message) => logger[level](message),
		methodHandler: (method, params, id) => invoker.invoke(method, params, id, conn),
	});
});

// WebSocketサーバーのエラーハンドラーを登録
wss.on('error', errorLogger);

// 一応起動したサーバーを返す
export let server = wss;
