/**
 * メソッドディレクトリのソースを実行するクラスのモジュール。
 * @module ./core/ws/method-invoker
 */
import * as path from 'path';
import * as S from 'string';
import fileUtils from '../utils/file-utils';
import objectUtils from '../utils/object-utils';

/**
 * メソッド実行イベント情報。
 */
export interface InvokedEvent {
	/** 実行するメソッド名 */
	method: string;
	/** メソッドの引数 */
	params?: any;
	/** メソッドの実体 */
	function?: Function;
}

/**
 * メソッドディレクトリのソースを実行するクラス。
 */
export class MethodInvoker {
	/**
	 * メソッドコールエラーのハンドラー。
	 * ※ エラーを解消しない場合は再スローすること。デフォルトは再スローのみ。
	 */
	errorHandler: (err: any, event?: InvokedEvent) => any = (err) => { throw err; };

	/** メソッド本体のディレクトリ */
	protected methodDir: string;
	/** 読み込んだメソッド */
	protected methods = new Map<string, Function>();

	/**
	 * 指定されたディレクトリのメソッドを呼び出すインスタンスを生成する。
	 * @param methodDir メソッドファイルのディレクトリパス。※相対パスはルートから
	 */
	constructor(methodDir: string) {
		this.methodDir = methodDir;

		// メソッドディレクトリの全ファイルをメッセージに対応する処理として読み込み
		// ※ ファイル名をメソッド名とみなす。ファイル名はキャメルケースに変換する
		const baseDir = path.join(path.resolve(this.methodDir), './');
		const funcs = fileUtils.requireDirectoriesRecursiveSync(baseDir);
		for (let p in funcs) {
			this.methods.set(S(p.replace(baseDir, "").replace(/\.[jt]s$/, "")).camelize().s, funcs[p]);
		}
	}

	/**
	 * メソッドを実行する。
	 * @param method 実行するメソッド名。
	 * @param params メソッドの引数。
	 * @returns メソッドの戻り値。
	 */
	invoke(method: string, params?: any): Promise<any> {
		return this.invokeImpl({ method: method, params: params });
	}

	/**
	 * メソッドを実行する（継承用）。
	 * @param event メソッド実行イベント情報。
	 * @returns メソッドの戻り値。
	 */
	protected invokeImpl(event: InvokedEvent): Promise<any> {
		try {
			if (!event.method) {
				throw new MethodNotFoundError(event.method);
			}
			// 読み込み済みのメソッドから一致するものを探索
			event.function = this.methods.get(event.method);
			if (!event.function || typeof event.function !== 'function') {
				throw new MethodNotFoundError(event.method);
			}

			// メソッドを実行する
			const result = this.doMethod(event);
			if (objectUtils.isPromise(result)) {
				return result.catch((e) => this.callErrorHandler(e, event));
			}
			return Promise.resolve(result);
		} catch (e) {
			// 同期処理用のキャッチ
			return this.callErrorHandler(e, event);
		}
	}

	/**
	 * メソッドコードを実行する。
	 * @param event メソッド実行イベント情報。
	 * @returns メソッドの戻り値。
	 */
	protected doMethod(event: InvokedEvent): any {
		return event.function(event.params);
	}

	/**
	 * メソッドコールのエラーハンドラーを実行する。
	 * @param err エラー情報。
	 * @param event メソッド実行イベント情報。
	 * @returns 処理結果。
	 */
	protected callErrorHandler(err: any, event: InvokedEvent): Promise<any> {
		try {
			// ※ エラーを解消しない場合は再スローされる想定
			return Promise.resolve(this.errorHandler(err, event));
		} catch (e) {
			return Promise.reject(err);
		}
	}
}

/**
 * メソッドなしを示す例外クラス。
 */
export class MethodNotFoundError extends Error {
	/**
	 * 例外を生成する。
	 * @param method メソッド名。
	 */
	constructor(method: string) {
		super(`${method} is not found`);
		this.name = "MethodNotFoundError";
	}
}