/**
 * @file new-room.tsのテスト。
 */
import * as assert from 'power-assert';
import clazz from '../../../src/ws/recv/new-room';

describe('new-room.ts', () => {
	it('成功', () => {
		const api = new clazz();
		const room = api.invoke({ name: 'UNITEST_ROOM' });
		assert.strictEqual(room.name, 'UNITEST_ROOM');
		assert.strictEqual(typeof room.id, 'number');
		assert.strictEqual(room.totalMembers, 0);
		assert.deepStrictEqual(room.messages, []);
	});
});