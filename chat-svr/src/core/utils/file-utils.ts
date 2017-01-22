/**
 * ファイル操作関連ユーティリティのNode.jsモジュール。
 * @module ./core/utils/file-utils
 */
import * as fs from 'fs';
import * as path from 'path';

/**
 * 指定されたディレクトリ下の全ファイルに再帰的に同期で渡された関数をコールする。
 * @param root 実行元パス。
 * @param func 実行する関数。
 */
function directoryWalkRecursiveSync(root: string, func: Function): void {
	fs.readdirSync(root).forEach((fname) => {
		const realpath = fs.realpathSync(path.join(root, fname));
		if (fs.statSync(realpath).isDirectory()) {
			directoryWalkRecursiveSync(realpath, func);
		} else {
			func(realpath);
		}
	});
}

/**
 * 指定されたディレクトリ下の全ファイルに同期で渡された関数をコールする。
 * @param root 実行元パス。
 * @param func 実行する関数。
 */
function directoryWalkSync(root: string, func: Function): void {
	fs.readdirSync(root).forEach((fname) => {
		const realpath = fs.realpathSync(path.join(root, fname));
		if (!fs.statSync(realpath).isDirectory()) {
			func(realpath);
		}
	});
}

export default {
	directoryWalkRecursiveSync: directoryWalkRecursiveSync,
	directoryWalkSync: directoryWalkSync,
};
