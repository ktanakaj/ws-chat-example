/**
 * JSON-RPC2関連機能モジュール。
 *
 * JSON-RPC2 の仕様については以下を参照。
 * http://www.jsonrpc.org/specification
 *
 * 本モジュールでは、基本的に入力は緩く受け付け、逆に出力は規格に厳密に行う。
 * @module ./core/json-rpc2
 */

export interface JsonRpc2Request {
	jsonrpc: string;
	method: string;
	params?: any;
	id?: number | string;
}

export interface JsonRpc2Response {
	jsonrpc: string;
	result?: any;
	error?: JsonRpc2ResponseError;
	id: number | string;
}

export interface JsonRpc2ResponseError {
	code: number;
	message: string;
	data?: any;
};

// ※ -32768 から -32000 は予約されているようなので通常のアプリで使わないよう注意
export enum ErrorCode {
	Default = -1,
	ParseError = -32700,
	InvalidRequest = -32600,
	MethodNotFound = -32601,
	InvalidParams = -32602,
	InternalError = -32603,
};

/**
 * JSON-RPC2リクエストをパースする。
 * @param message パースするJSON文字列。
 * @returns パースしたリクエスト（バッチ実行の場合配列）。
 */
export function parseRequest(message: string): JsonRpc2Request | JsonRpc2Request[] {
	// ※ 現状はJSONのパースと一括でエラーにできるチェックだけ
	//    （ここで中身までみると、バッチが全部エラーになってしまうので）
	let req: any;
	try {
		req = JSON.parse(message);
	} catch (e) {
		throw new JsonRpcError(ErrorCode.ParseError);
	}
	if (!(req instanceof Object)) {
		throw new JsonRpcError(ErrorCode.InvalidRequest);
	}
	if (Array.isArray(req) && req.length === 0) {
		throw new JsonRpcError(ErrorCode.InvalidRequest);
	}
	return req;
}

/**
 * JSON-RPC2レスポンスを生成する。
 * @param id リクエストのID。リクエストのパース失敗などではnull。
 * @param result リクエストの処理結果。
 * @param error リクエストがエラーの場合のエラー情報。
 * @returns 生成したレスポンス。
 */
export function createResponse(id: string | number, result: any, error?: any): JsonRpc2Response {
	if (id === undefined || id === null) {
		id = null;
	} else if (typeof (id) !== "number") {
		id = String(id);
	}
	const res: JsonRpc2Response = { jsonrpc: "2.0", id: id };
	if (error) {
		if (!(error instanceof JsonRpcError)) {
			error = errorToJsonRpcError(error);
		}
		res.error = error;
	} else if (result) {
		res.result = result;
	}
	return res;
}

/**
 * JSON-RPC2のエラー情報と互換性を持たせた例外クラス。
 */
export class JsonRpcError extends Error {
	code: number;
	data: any;

	/**
	 * 例外を生成する。
	 * @param code エラーコード。
	 * @param message 例外エラーメッセージ。
	 * @param data 例外追加情報。
	 */
	constructor(code: number = ErrorCode.Default, message?: string, data?: any) {
		super(message || makeDefaultErrorMessage(code));
		this.name = 'JsonRpcError';
		this.code = code;
		this.data = data;
	}

	/**
	 * JSON-RPC2エラー情報形式のJSONを生成する。
	 * @returns JSON-RPC2エラー情報。
	 */
	toJSON(): JsonRpc2ResponseError {
		const json: JsonRpc2ResponseError = {
			code: Number(this.code),
			message: String(this.message),
		};
		if (this.data !== undefined) {
			json.data = this.data;
		}
		return json;
	}
}

/**
 * エラーコードからデフォルトエラーメッセージを生成する。
 * @param code エラーコード。
 * @return エラーメッセージ。
 */
function makeDefaultErrorMessage(code: number): string {
	switch (code) {
		case ErrorCode.ParseError:
			return 'Parse error';
		case ErrorCode.InvalidRequest:
			return 'Invalid Request';
		case ErrorCode.MethodNotFound:
			return 'Method not found';
		case ErrorCode.InvalidParams:
			return 'Invalid params';
		case ErrorCode.InternalError:
			return 'Internal error';
	}
	if (code >= -32000 && code <= -32099) {
		return 'Server error';
	}
	return 'Unknown Error';
}

/**
 * 形式不明のエラー情報をJSON-RPC2用エラーに変換する。
 * @param error エラー情報。
 * @returns 生成したエラー。
 */
function errorToJsonRpcError(error: any): JsonRpcError {
	if (error instanceof JsonRpcError) {
		return error;
	}
	const json = new JsonRpcError();
	if (error instanceof Error) {
		if (error['code']) {
			json.code = error['code'];
		}
		if (error['message']) {
			json.message = error['message'];
		}
		if (error['data']) {
			json.data = error['data'];
		}
	} else {
		json.message = String(error);
	}
	return json;
}