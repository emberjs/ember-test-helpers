import Ember from 'ember';
import { module, test } from 'qunit';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { setupContext, teardownContext, setupOnerror } from '@ember/test-helpers';

module('setupOnerror', function() {
  if (!hasEmberVersion(2, 4)) {
    test('Will throw if on < Ember 2.4', function(assert) {
      assert.expect(1);

      assert.throws(function() {
        setupOnerror();
      }, 'The `setupOnerror` function requires that you be on a minimum version of Ember 2.4.');
    });
  }

  if (hasEmberVersion(2, 4)) {
    test('Ember.onerror is undefined by default', function(assert) {
      assert.expect(1);

      assert.equal(Ember.onerror, undefined);
    });

    test('Ember.onerror is set correctly when using setupOnerror', async function(assert) {
      assert.expect(2);

      let context = {};
      let onerror = err => err;

      assert.equal(Ember.onerror, undefined);

      await setupContext(context);

      setupOnerror(onerror);

      assert.equal(Ember.onerror, onerror);

      await teardownContext(context);
    });

    test('Ember.onerror is reset correctly when teardownContext is invoked', async function(assert) {
      assert.expect(3);

      let context = {};
      let onerror = err => err;

      assert.equal(Ember.onerror, undefined);

      await setupContext(context);

      setupOnerror(onerror);

      assert.equal(Ember.onerror, onerror);

      await teardownContext(context);

      assert.equal(Ember.onerror, undefined);
    });
  }
});
