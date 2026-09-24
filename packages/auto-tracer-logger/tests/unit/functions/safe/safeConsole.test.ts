import { beforeEach, describe, expect, it, vi } from 'vitest';
import { safeConsole } from '../../../../src/lib/functions/safe/safeConsole.js';
import type { LogLevel } from '../../../../src/lib/types/LogLevel.js';

describe('safeConsole', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call console.error for fatal level', () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		safeConsole('fatal' as LogLevel, 'test message', 123);

		expect(errorSpy).toHaveBeenCalledWith('test message', 123);
	});

	it('should call console.error for error level', () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		safeConsole('error' as LogLevel, 'error message');

		expect(errorSpy).toHaveBeenCalledWith('error message');
	});

	it('should call console.warn for warn level', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		safeConsole('warn' as LogLevel, 'warning message');

		expect(warnSpy).toHaveBeenCalledWith('warning message');
	});

	it('should call console.info for info level', () => {
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

		safeConsole('info' as LogLevel, 'info message');

		expect(infoSpy).toHaveBeenCalledWith('info message');
	});

	it('should call console.log for debug level', () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		safeConsole('debug' as LogLevel, 'debug message');

		expect(logSpy).toHaveBeenCalledWith('debug message');
	});

	it('should call console.log for log level', () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		safeConsole('log' as LogLevel, 'log message');

		expect(logSpy).toHaveBeenCalledWith('log message');
	});

	it('should call console.log for verbose level', () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		safeConsole('verbose' as LogLevel, 'verbose message');

		expect(logSpy).toHaveBeenCalledWith('verbose message');
	});

	it('should call console.log for trace level', () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		safeConsole('trace' as LogLevel, 'trace message');

		expect(logSpy).toHaveBeenCalledWith('trace message');
	});

	it('should not throw when console method throws', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {
			throw new Error('Console error');
		});

		expect(() => {
			safeConsole('error' as LogLevel, 'test');
		}).not.toThrow();
	});

	it('should handle multiple optional parameters', () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		safeConsole('fatal' as LogLevel, 'message', 'param1', 123, { key: 'value' });

		expect(errorSpy).toHaveBeenCalledWith('message', 'param1', 123, { key: 'value' });
	});
});
