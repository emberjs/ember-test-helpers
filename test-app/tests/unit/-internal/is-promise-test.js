import { module, test } from 'qunit';
import isPromise from '@ember/test-helpers/-internal/is-promise';

module('isPromise', function () {
  test('detects promise-like like values', function (assert) {
    assert.ok(isPromise(new Promise(() => {})));
    assert.ok(isPromise(Promise.resolve()));
    assert.ok(isPromise({ then() {} }));
    const functionObject = () => {};
    functionObject.then = () => {};
    assert.ok(isPromise(functionObject));
  });

  test('it if a value is not a promise-like value', function (assert) {
    assert.notOk(isPromise());
    assert.notOk(isPromise(undefined));
    assert.notOk(isPromise(null));
    assert.notOk(isPromise(1));
    assert.notOk(isPromise(NaN));
    assert.notOk(isPromise({}));
    assert.notOk(isPromise(() => {}));
  });
});
