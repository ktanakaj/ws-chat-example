/**
 * ChatサンプルアプリWebSocketサーバの起動モジュール。
 * @module ./ws
 */
import * as path from 'path';
import * as WebSocket from 'ws';
import * as config from 'config';
import * as log4js from 'log4js';
import * as Ajv from 'ajv';
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import fileUtils from '../core/utils/file-utils';
import { WebSocketRpcConnection } from '../core/ws/ws-rpc-connection';
import { RpcMethodInvoker, RpcInvokableClass } from '../core/ws/rpc-method-invoker';
import { WebSocketConnectionMap } from '../core/ws/ws-connection-map';
import { BadRequestError, InternalServerError } from '../core/errors';
const wsLogger = log4js.getLogger('ws');
const errorLogger = log4js.getLogger('error');
const WebSocketServer = WebSocket.Server;

/**
 * WebSocketサーバを作成する。
 * @param options サーバーの起動オプション。
 * @param methodDir メソッドディレクトリのパス。※相対パスはルートから
 */
export function createServer(options: WebSocket.ServerOptions, methodDir: string): void {
	const wss = new WebSocketServer(options);

	// 受信メソッドディレクトリの実行インスタンスを作成
	const invoker = new RpcMethodInvoker(path.join(methodDir, 'recv'));
	invoker.before = preprocessInvoke;

	// コネクション管理用のマップを作成
	const connections = new WebSocketConnectionMap();

	// コネクションハンドラーを登録
	wss.on('connection', (ws) => {
		const conn = new WebSocketRpcConnection(ws, {
			logger: (level, message) => wsLogger[level](message),
			keepAliveTime: config['keepAliveTime'],
			methodHandler: (method, params, id) => invoker.invoke(method, params, id, conn).catch(handleInvokerError),
		});

		// エラーはコネクション側でログが出るのでここでは無視
		conn.on('error', () => { });

		// 管理用のマップにも登録 ※oncloseで自動削除
		connections.push(conn);
	});

	// WebSocketサーバーのエラーハンドラーを登録
	wss.on('error', (err) => errorLogger.error(err));

	// 送信メソッドディレクトリを読み込み
	// ※ 受信と違って送信はうまい共通化手段が浮かばないが、サービス側から参照するのは嫌なので、
	//    送信ディレクトリとしてインポート等だけして各々のファイルで勝手にイベントに登録なりしてもらう。
	const senders = fileUtils.requireDirectoriesRecursiveSync(path.join(methodDir, 'send'));
	for (let p in senders) {
		// ※ クラスが定義されていたら、newしてconnectionsだけ渡す
		const clazz = senders[p]['default'] || senders[p];
		const sender = new clazz();
		sender['connections'] = connections;
	}
}

/**
 * メソッド実行の前処理を行う。
 * @param params メソッドの引数。
 * @param instance 実行可能なクラスを使用している場合、そのインスタンス。
 * @return 前処理されたメソッドの引数。
 */
function preprocessInvoke(params: any, instance?: RpcInvokableClass<WebSocketRpcConnection>): any {
	if (instance) {
		// 利便性のためsessionを直下にもコピー
		instance['session'] = instance.connection.session;

		// スキーマ定義を元にバリデーション実施
		if (instance['schema']) {
			const ajv = new Ajv();
			if (!ajv.validate(instance['schema'], params)) {
				throw new BadRequestError(ajv.errors[0].message, ajv.errors);
			}
		}
	}
	return params;
}

/**
 * メソッドエラーのエラーハンドラー。
 * @param err エラー。
 */
function handleInvokerError(err: any): void {
	// 例外をJsonRpcErrorに変換してスローする
	let rpcError: JsonRpcError = null;
	if (err instanceof JsonRpcError) {
		rpcError = err;
	} else {
		rpcError = new InternalServerError(err.message || err, err);
	}

	// エラーの内容によってログ出力を制御する。
	// ・バリデーションエラーなどサーバーとしては正常なものはエラーログに出さない
	// ・それ以外のサーバーのエラーや想定外のものはログに出す
	let logLevel = 'error';
	if (rpcError.code === ErrorCode.ParseError || rpcError.code === ErrorCode.InvalidRequest
		|| rpcError.code === ErrorCode.MethodNotFound || rpcError.code === ErrorCode.InvalidParams) {
		logLevel = 'debug';
	}
	// ※ ログにはオリジナルのエラーを出す
	errorLogger[logLevel](err);

	// クライアントにエラーを返す
	throw rpcError;
}