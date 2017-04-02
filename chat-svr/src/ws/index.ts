/**
 * WebSocketサーバの初期化モジュール。
 * @module ./ws
 */
import * as config from 'config';
import { createServer } from '../core';

// WebSocketサーバーを起動
const wssInfo = createServer(config['websocket'], "lib/ws/recv");

// サービス層にWebSocket層用のイベントを登録
import registerNotifyRoomStatus from './send/notify-room-status';
registerNotifyRoomStatus(wssInfo.connections);
import registerNotifyMessage from './send/notify-message';
registerNotifyMessage(wssInfo.connections);
