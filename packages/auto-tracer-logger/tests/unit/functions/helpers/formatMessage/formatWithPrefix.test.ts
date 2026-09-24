import { describe, expect, it } from 'vitest';
import { formatWithPrefix } from '../../../../../src/lib/functions/helpers/formatMessage/formatWithPrefix.js';

describe('formatWithPrefix', () => {
	it('should format single-line message with prefix', () => {
		const result = formatWithPrefix('[INFO]', 'test message');
		expect(result).toBe('[INFO] test message');
	});

	it('should format multiline message with prefix on each line', () => {
		const result = formatWithPrefix('[ERROR]', 'Line 1\nLine 2\nLine 3');
		expect(result).toBe('[ERROR] Line 1\n[ERROR] Line 2\n[ERROR] Line 3');
	});

	it('should handle empty message', () => {
		const result = formatWithPrefix('[WARN]', '');
		expect(result).toBe('[WARN] ');
	});

	it('should handle non-string message types', () => {
		const result = formatWithPrefix('[LOG]', 123);
		expect(result).toBe('[LOG] 123');
	});

	it('should handle object message', () => {
		const result = formatWithPrefix('[DEBUG]', { key: 'value' });
		expect(result).toBe('[DEBUG] [object Object]');
	});

	it('should handle null message', () => {
		const result = formatWithPrefix('[TRACE]', null);
		expect(result).toBe('[TRACE] null');
	});

	it('should handle undefined message', () => {
		const result = formatWithPrefix('[FATAL]', undefined);
		expect(result).toBe('[FATAL] undefined');
	});

	it('should handle message with multiple consecutive newlines', () => {
		const result = formatWithPrefix('[INFO]', 'Line 1\n\nLine 3');
		expect(result).toBe('[INFO] Line 1\n[INFO] \n[INFO] Line 3');
	});
});
