import assert = require('assert');
import ASA = require('../assertThrowsAsync');
import sms = require('source-map-support');
sms.install();

class SpecialError extends Error { };

let run = false;
let compared = false;

function runTests(niceFunction: () => void, naughtyFunction: () => void, specialFunction: () => void) {


	beforeEach(() => {
		run = false;
		compared = false;
	})

	it('should catch a function that throws', async () => {
		await ASA(naughtyFunction);
		assert.strictEqual(run, true);
	});


	it('should catch a function that throws a special error', async () => {
		await ASA(specialFunction);
		assert.strictEqual(run, true);
	});

	it('should catch a function that throws a special error and is asked for', async () => {
		await ASA(specialFunction, SpecialError);
		assert.strictEqual(run, true);
	});

	it('should miss a function that throws a special error that is not asked for', async () => {
		try {
			await ASA(naughtyFunction, SpecialError);
		} catch (e) {

			assert(e instanceof Error);
			assert.strictEqual(e.message, 'catch me');
			// ok;
			return;
		}
		assert.fail('Did not catch');
	});

	it('should catch a function that throws a special error by successful throwing function', async () => {
		await ASA(specialFunction, SpecialError, (e) => {
			compared = true;
			assert.equal(e.message, 'catch me');
		});

		assert(compared);
	});


	class ConditionFailed extends Error { }

	it('should throw a function that throws a special error by failing throwing function', async () => {
		try {
			await ASA(specialFunction, (e) => {
				throw new ConditionFailed();
			});
		} catch (e) {
			assert(e instanceof ConditionFailed);
			return;
		}
		assert.fail('fail')
	})


	it('should catch a function that throws a special error by bool function', async () => {
		await ASA(specialFunction, SpecialError, (e) => {
			compared = true;
			return (e.message === 'catch me');
		});

		assert(compared);
	});

	it('should miss a function that throws a special error by failing bool function', async () => {
		try {
			await ASA(specialFunction, SpecialError, (e) => {
				compared = true;
				return (e.message === 'don\'t catch me');
			});
		} catch (e) {
			assert(e instanceof SpecialError);
			assert.strictEqual(e.message, 'catch me');
			assert(compared);
			return;
		}

		assert.fail('fail')

	})

	it('should catch a function that throws by throwing function', async () => {
		await ASA(specialFunction, (e) => {
			compared = true;
			assert.equal(e.message, 'catch me'); 
		});

		assert(compared);
	});
	it('should miss a function that throws by failing throwing function', async () => {
		try {
			await ASA(specialFunction, (e) => {
				throw new ConditionFailed();
			}); 
		} catch (e) {
			assert(e instanceof ConditionFailed);
			return;
		}

		assert.fail('fail');
	});

	it('should catch a function that throws by bool function', async () => {
		await ASA(specialFunction, (e) => {
			compared = true;
			return (e.message === 'catch me');
		});

		assert(compared);
	});

	it('should miss a function that throws by bool function', async () => {
		try {
			await ASA(specialFunction, (e) => {
				compared = true;
				return (e.message === 'don\'t catch me');
			});
		} catch (e) {
			assert(e instanceof Error);
			assert.strictEqual(e.message, 'catch me');
			assert(compared);
			return;
		}

		assert.fail('fail')
	});

	it('should catch a function that matches the string condition', async () => {
		await ASA(specialFunction, 'catch me');
	})

	it('should throw when a function does not match the string condition', async () => {
		try {
			await ASA(specialFunction, 'don\'t catch me');
		} catch (e) {
			assert(e instanceof SpecialError);
			assert.strictEqual(e.message, 'catch me');
			return;
		}
		assert.fail('fail')
	});

	it('should throw when a function does not throw an error', async () => {
		try {
			await ASA(niceFunction);
		} catch (e) {
			assert(e instanceof assert.AssertionError);
			assert.strictEqual(e.message, 'Expected to throw');
			return;
		}
		assert.fail('fail');
	});
};


describe('synchronous throwing', () => {

	const niceFunction = () => {};

	const naughtyFunction = () => {
		run = true;
		throw new Error('catch me');
	};

	const specialFunction = () => {
		run = true;
		throw new SpecialError('catch me');
	}

	runTests(niceFunction, naughtyFunction, specialFunction);

});

function wait(ms: number) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	})
}

describe('asynchronous throwing', () => {

	const niceFunction = async () => {
		await wait(1);
	}

	const naughtyFunction = async () => {
		await wait(10);
		run = true;
		throw new Error('catch me');
	};

	const specialFunction = async () => {
		await wait(10);
		run = true;
		throw new SpecialError('catch me');
	}

	runTests(niceFunction, naughtyFunction, specialFunction);
	
})