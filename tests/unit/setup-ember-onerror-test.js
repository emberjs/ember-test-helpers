import Ember from 'ember';
import { module, test } from 'qunit';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { setupContext, teardownContext } from '@ember/test-helpers';
import { setupOnerror, resetOnerror } from '@ember/test-helpers';

module('setupOnerror', function (hooks) {
  let context;

  hooks.beforeEach(function () {
    context = {};
  });

  hooks.afterEach(async function () {
    if (context.owner) {
      await teardownContext(context);
    }
  });

  if (hasEmberVersion(2, 4)) {
    module('with context set', function (hooks) {
      hooks.beforeEach(async function () {
        await setupContext(context);
      });

      test('Ember.onerror is undefined by default', function (assert) {
        assert.expect(1);

        assert.equal(Ember.onerror, undefined);
      });

      test('Ember.onerror is setup correctly', async function (assert) {
        assert.expect(2);

        let onerror = (err) => err;

        assert.equal(Ember.onerror, undefined);

        setupOnerror(onerror);

        assert.equal(Ember.onerror, onerror);
      });

      test('Ember.onerror is reset correctly', async function (assert) {
        assert.expect(3);

        let onerror = (err) => err;

        assert.equal(Ember.onerror, undefined);

        setupOnerror(onerror);

        assert.equal(Ember.onerror, onerror);

        resetOnerror();

        assert.equal(Ember.onerror, undefined);
      });
    });

    test('it raises an error without context', function (assert) {
      assert.throws(() => {
        setupOnerror();
      }, /Must setup test context before calling setupOnerror/);
    });

    test('resetOnerror does not raise an error without context', function (assert) {
      resetOnerror();
      assert.ok(true, 'nothing was thrown');
    });
  }
});
