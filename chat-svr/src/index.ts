/**
 * @file Chatサンプルアプリ起動スクリプト。
 */
import * as config from 'config';
import * as log4js from 'log4js';
import 'source-map-support/register';
import { createServer } from './ws';
const packagejson = require('../package.json');

// log4jsを初期設定
log4js.configure(config['log4js']);

// WebSocketサーバを起動
createServer(config['websocket'], "dist/ws");
log4js.getLogger('debug').info(`${packagejson['name']}@${packagejson['version']} started`);