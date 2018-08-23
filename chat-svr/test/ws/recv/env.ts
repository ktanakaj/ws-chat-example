/**
 * @file env.tsのテスト。
 */
import * as assert from 'power-assert';
const packagejson = require('../../../package.json');
import func from '../../../src/ws/recv/env';

describe('env.ts', () => {
	it('成功', () => {
		const result = func();
		assert.deepStrictEqual(result, { environment: 'test', version: packagejson['version'] });
	});
});