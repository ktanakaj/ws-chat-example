/**
 * メソッドディレクトリのソースを実行するクラスのモジュール。
 * @module ./core/ws/method-invoker
 */
import * as path from 'path';
import * as S from 'string';
import fileUtils from '../utils/file-utils';

/**
 * メソッドディレクトリのソースを実行するクラス。
 */
export class MethodInvoker {
	/** 読み込んだメソッド */
	protected methods = new Map<string, Function>();

	/**
	 * 指定されたディレクトリのメソッドを呼び出すインスタンスを生成する。
	 * @param methodDir メソッドファイルのディレクトリパス。※相対パスはルートから
	 */
	constructor(methodDir: string) {
		// メソッドディレクトリの全ファイルをメッセージに対応する処理として読み込み
		// ※ ファイル名をメソッド名とみなす。ファイル名はキャメルケースに変換する
		const baseDir = path.join(path.resolve(methodDir), './');
		const funcs = fileUtils.requireDirectoriesRecursiveSync(baseDir);
		for (let p in funcs) {
			this.methods.set(S(p.replace(baseDir, "").replace(/\.[jt]s$/, "")).camelize().s, funcs[p]['default'] || funcs[p]);
		}
	}

	/**
	 * メソッドを実行する。
	 * @param method 実行するメソッド名。
	 * @param params メソッドの引数。
	 * @returns メソッドの戻り値。
	 */
	public invoke(method: string, params?: any): Promise<any> {
		try {
			const f = this.getMethod(method);
			return Promise.resolve(f(params));
		} catch (e) {
			return Promise.reject(e);
		}
	}

	/**
	 * メソッドを取得する。
	 * @param method メソッド名。
	 * @returns メソッド。
	 * @throws MethodNotFoundError メソッドが存在しない場合。
	 */
	protected getMethod(method: string): Function {
		// メソッド名が指定されているかチェック
		if (!method) {
			throw new MethodNotFoundError(method);
		}
		// 読み込み済みのメソッドから一致するものを探索
		const f = this.methods.get(method);
		if (!f || typeof f !== 'function') {
			throw new MethodNotFoundError(method);
		}
		return f;
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