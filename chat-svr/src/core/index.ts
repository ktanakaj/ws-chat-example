/**
 * WebSocketサーバのNode.jsモジュール。
 *
 * このディレクトリは、アプリ固有のロジックを含めない、
 * WebSocketフレームワーク/ライブラリ的なモジュールを配置。
 * @module ./core
 */
import * as WebSocket from 'ws';
import * as config from 'config';
import connetionHandler from './connection-handler';
import errorHandler from './error-handler';

// WebSocketサーバを起動
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer(config['websocket']);
wss.on('connection', connetionHandler);
wss.on('error', errorHandler);

// 一応起動したサーバーを返す
export let server = wss;