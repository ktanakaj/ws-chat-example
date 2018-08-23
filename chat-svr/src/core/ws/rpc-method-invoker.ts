/**
 * RPCに対応するメソッドディレクトリのソースを実行するクラスのモジュール。
 * @module ./core/ws/rpc-method-invoker
 */
import { JsonRpcError, ErrorCode } from 'json-rpc2-implementer';
import { MethodInvoker, MethodNotFoundError } from './method-invoker';
import objectUtils from '../utils/object-utils';

/**
 * RPCメソッドクラス。
 */
export interface RpcInvokableClass<TConnection> {
	/** メソッド */
	invoke: Function;
	/** RPCのID */
	id?: number | string;
	/** RPCコネクション */
	connection?: TConnection;
}

/**
 * RPCに対応するメソッドディレクトリのソースを実行するクラス。
 */
export class RpcMethodInvoker<TConnection> extends MethodInvoker {
	/** メソッドの前処理用関数。 */
	public before = (params: any, instance?: RpcInvokableClass<TConnection>): any => params;
	/** メソッドの後処理用関数。 */
	public after = (result: any, params: any, instance?: RpcInvokableClass<TConnection>): any => result;

	/**
	 * メソッドを実行する。
	 * @param method 実行するメソッドもしくはメソッドクラス。
	 * @param params メソッドの引数。
	 * @param id RPCのID。
	 * @param connection RPCコネクション。
	 * @returns メソッドの戻り値。
	 */
	public invoke(method: string, params: any, id?: number | string, connection?: TConnection): Promise<any> {
		try {
			return this.doMethod(this.getMethod(method), params, id, connection);
		} catch (e) {
			if (e instanceof MethodNotFoundError) {
				e = new JsonRpcError(ErrorCode.MethodNotFound);
			}
			return Promise.reject(e);
		}
	}

	/**
	 * 渡されたメソッドを実行する。
	 * @param func 実行するメソッドもしくは実行可能なクラス。
	 * @param params メソッドの引数。
	 * @param id RPCのID。
	 * @param connection RPCコネクション。
	 * @returns メソッドの戻り値。
	 */
	protected async doMethod(func: Function, params: any, id?: number | string, connection?: TConnection): Promise<any> {
		// もしファンクションがinvokeという関数をもつ場合は、実行可能なクラスとしてnewして実行する
		let instance = null;
		if (this.isInvokableClass(func)) {
			// 補助的な情報をプロパティに詰める
			instance = this.newInvokableClass(func, id, connection);
			func = instance.invoke.bind(instance);
		}

		// メソッドの実行前後にbefore/afterを処理する
		params = await objectUtils.invokeAsPromise(() => this.before(params, instance));
		const result = await objectUtils.invokeAsPromise(() => func(params));
		return await objectUtils.invokeAsPromise(() => this.after(result, params, instance));
	}

	/**
	 * 関数は実行可能なクラス（invoke というメソッドを持ったクラス）か？
	 * @param func チェックする関数。
	 * @returns 実行可能なクラスの場合true。
	 */
	protected isInvokableClass(func: Function): boolean {
		return func.prototype.invoke && typeof func.prototype.invoke === 'function';
	}

	/**
	 * 実行可能なクラスを生成する。
	 * @param clazz クラス。
	 * @param id RPCのID。
	 * @param connection RPCコネクション。
	 * @returns 実行可能なクラスの場合true。
	 */
	protected newInvokableClass(clazz: Function, id?: number | string, connection?: TConnection): RpcInvokableClass<TConnection> {
		const instance = new (<any>clazz)();
		instance.id = id;
		instance.connection = connection;
		return instance;
	}
}
