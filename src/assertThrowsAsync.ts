import assert = require('assert');

export type ErrorCheck<E> = string | RegExp | ((e: E) => boolean|void);
export type EConstructor<E> = new(...args: any[]) => E;

export async function assertThrows<Error>(
	f: Function,
): Promise<void>;

export async function assertThrows<E extends Error = Error> (
	f: Function,
	errorMessageOrFunction: ErrorCheck<E>
): Promise<void>

export async function assertThrows<E extends Error>(
	f: Function,
	errorType: EConstructor<E>
): Promise<void>;


export async function assertThrows<E extends Error> (
	f: Function,
	errorType: EConstructor<E>,
	errorMessageOrFunction: ErrorCheck<E>
): Promise<void>

export async function assertThrows<E extends Error = Error>(
		f: Function,
		_arg1?: EConstructor<E> | ErrorCheck<E>, // this is ~= "typeof E"
		_arg2?: ErrorCheck<E>
	): Promise<void> {
	let result: any;

	let errorType: EConstructor<E> | undefined = undefined;
	let errorCheck: ErrorCheck<E> | undefined = undefined;

	if (!_arg1) {
		// pass
	} else if (Error.isPrototypeOf(_arg1 as any)) {
		errorType = _arg1 as any;
	} else {
		errorCheck = _arg1 as any;
	}

	if (!_arg2) {
		// pass
	} else {
		errorCheck = _arg2;
	}

	try {
		result = await f();
	} catch (err) {
		if (errorType) {
			if (err instanceof errorType) {
				// ok
			} else {
				throw err
			}
		}
		if (errorCheck) {
			if (typeof errorCheck === 'string') {
				if (err.message !== errorCheck) {
					throw err;
				}
			} else if (typeof errorCheck === 'function') {
				if (errorCheck(err) === false) {
					throw err;
				}
			} else if (errorCheck instanceof RegExp) {
				assert(errorCheck.test(err.message));
			} else {
				throw new TypeError('ErrorCheck needs to be a string, (Error) => bool, or regex.')
			}
		}
		return;

	}
	throw new assert.AssertionError({message: 'Expected to throw', expected: errorType, actual: result});
}

