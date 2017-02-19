/**
 * RPCに対応するメソッドディレクトリのソースを実行するクラスのモジュール。
 * @module ./core/ws/rpc-method-invoker
 */
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import { MethodInvoker, InvokedEvent, MethodNotFoundError } from './method-invoker';
import { WebSocketRpcConnection } from './ws-rpc-connection';

/**
 * RPCメソッド実行イベント情報。
 */
export interface RpcInvokedEvent extends InvokedEvent {
	/** RPCのID */
	id?: number | string,
	/** WebSocket/RPCコネクション */
	connection?: WebSocketRpcConnection,
	/** メソッドクラスのインスタンス */
	instance?: RpcInvokableClass,
}

/**
 * RPCメソッドクラス。
 */
export interface RpcInvokableClass {
	/** メソッド */
	invoke: Function,
	/** RPCのID */
	id?: number | string,
	/** WebSocket/RPCコネクション */
	connection?: WebSocketRpcConnection,
	/** セッション情報 */
	session?: Object,
}

/**
 * RPCに対応するメソッドディレクトリのソースを実行するクラス。
 */
export class RpcMethodInvoker extends MethodInvoker {
	/**
	 * メソッドを実行する。
	 * @param method 実行するメソッドもしくはメソッドクラス。
	 * @param params メソッドの引数。
	 * @param id RPCのID。
	 * @param connection WebSocket/RPCコネクション。
	 * @returns メソッドの戻り値。
	 */
	invoke(method: string, params: any, id?: number | string, connection?: WebSocketRpcConnection): Promise<any> {
		const event = {
			method: method,
			params: params,
			id: id,
			connection: connection,
		};
		return this.invokeImpl(event)
			.catch((e) => {
				if (e instanceof MethodNotFoundError) {
					throw new JsonRpcError(ErrorCode.MethodNotFound);
				}
				throw e;
			});
	}

	/**
	 * メソッドコードを実行する。
	 *
	 * メソッドコードは、通常の関数、もしくは method というメソッドを持ったクラスであること。
	 * @param event メソッド実行イベント情報。
	 * @returns メソッドの戻り値。
	 */
	protected doMethod(event: RpcInvokedEvent): any {
		// もしファンクションがinvokeという関数をもつ場合は、メソッドクラスとしてnewして実行する
		if (event.function.prototype.invoke && typeof event.function.prototype.invoke === 'function') {
			return this.doMethodClass(event);
		} else {
			return super.doMethod(event);
		}
	}

	/**
	 * メソッドクラスを実行する。
	 * @param event メソッド実行イベント情報。
	 * @returns メソッドの戻り値。
	 */
	protected doMethodClass(event: RpcInvokedEvent): any {
		// サブ的な情報をプロパティとして渡す
		event.instance = new (<any>event.function)();
		event.instance.id = event.id;
		event.instance.connection = event.connection;
		event.instance.session = event.connection.session;
		return event.instance.invoke(event.params);
	}
}
