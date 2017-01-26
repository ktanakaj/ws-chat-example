/**
 * @file Chatサンプルアプリ起動スクリプト。
 */
import * as config from 'config';
import * as log4js from 'log4js';
import 'source-map-support/register';

// log4jsを初期設定
log4js.configure(config['log4js']);

// WebSocketサーバを起動
import './core';