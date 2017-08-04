# assert-throws-async

Node's builtin `assert.throws` does not work very well with rejecting promises or (equivalently) async functions.

This wrapper fixes this.

It also allows you to pass both validation functions and constructors to compare with as I got sick of typing `e instanceof MyError` in my validation functions.

## Examples:

```js
const assertThrows = require('assert-throws-async'); 

class MyError extends Error { }
const naughtyFunction = () => {
	return Promise.reject(new MyError('waaat'));
}

//...

assertThrows(naughtyFunction, MyError, 'waaat');
```

## Usage:


```ts
assertThrows(f: Function, errorCheck: string | RegExp | ((Error) => boolean));
```
Runs `f()`.

If it throws or returns a promise that rejects with `e`:
  - if `errorCheck` is a string or RegExp, check `e.message` against `errorCheck`
  - If `errorCheck` is a function, run `errorCheck(e)`.

If either of these checks are unsuccesful, re-throw `e`.

If `f` does not throw `e`, throw an `AssertionError('Expected to throw.')`.


```ts
assertThrows(f: Function, ErrorType: class<Error>);
```
Runs `f()`.

If it throws or returns a promise that rejects with `e`:
  - if `e` is not an instance of ErrorType, re-throw `e`.


If `f` does not throw `e`, throw an `AssertionError('Expected to throw.')`.


```ts
assertThrows(f: Function, ErrorType: class<Error>, errorCheck: string | RegExp | ((Error) => boolean) );
```
Combines both the above checks. The ErrorType check is executed first.



