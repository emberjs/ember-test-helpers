import Ember from 'ember';
import { module, test } from 'qunit';
import { isSettled, getSettledState, pauseTestFor } from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { _setupAJAXHooks, _teardownAJAXHooks } from '@ember/test-helpers/settled';
import { next, later, run, schedule } from '@ember/runloop';
import Pretender from 'pretender';
import hasjQuery from '../helpers/has-jquery';
import ajax from '../helpers/ajax';
import RSVP from 'rsvp';

module('settled', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(function(assert) {
    _setupAJAXHooks();

    this.confirmSettles = done => {
      return function() {
        setTimeout(() => {
          assert.strictEqual(isSettled(), true, 'post cond - isSettled');
          assert.deepEqual(
            getSettledState(),
            {
              hasPendingRequests: false,
              hasPendingTimers: false,
              hasPendingWaiters: false,
              hasPendingTransitions: null,
              hasPendingPauseTestForPromises: false,
              hasRunLoop: false,
              pendingRequestCount: 0,
            },
            'post cond - getSettledState'
          );

          done();
        });
      };
    };

    this.server = new Pretender(function() {
      this.get(
        '/whazzits',
        function() {
          return [200, { 'Content-Type': 'text/plain' }, 'Remote Data!'];
        },
        25
      );
    });

    this._waiter = () => {
      return !this.isWaiterPending;
    };

    // In Ember < 2.8 `registerWaiter` expected to be bound to
    // `Ember.Test` 😭
    //
    // Once we have dropped support for < 2.8 we should swap this to
    // use:
    //
    // import { registerWaiter } from '@ember/test';
    Ember.Test.registerWaiter(this._waiter);
  });

  hooks.afterEach(function() {
    Ember.Test.unregisterWaiter(this._waiter);
    this.server.shutdown();
    _teardownAJAXHooks();
  });

  module('isSettled', function() {
    test('when no work is scheduled, no requests, waiters completed', function(assert) {
      assert.strictEqual(isSettled(), true);
    });

    test('when work is scheduled via run.schedule', function(assert) {
      assert.expect(4);
      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      schedule('actions', this.confirmSettles(done));

      assert.strictEqual(isSettled(), false);
    });

    test('when work is scheduled via run.next', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      next(this.confirmSettles(done));

      assert.strictEqual(isSettled(), false);
    });

    test('when work is scheduled via run.later', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      later(this.confirmSettles(done), 15);

      assert.strictEqual(isSettled(), false);
    });

    test('when invocation is within a run loop', function(assert) {
      assert.expect(3);

      assert.strictEqual(isSettled(), true, 'precond');

      run(() => {
        assert.strictEqual(isSettled(), false);
      });

      assert.strictEqual(isSettled(), true, 'post cond');
    });

    test('when AJAX requests are pending', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      ajax('/whazzits').then(this.confirmSettles(done));

      assert.strictEqual(isSettled(), false);
    });

    test('when waiters are pending', function(assert) {
      assert.expect(3);

      assert.strictEqual(isSettled(), true, 'precond');

      this.isWaiterPending = true;

      assert.strictEqual(isSettled(), false);

      this.isWaiterPending = false;

      assert.strictEqual(isSettled(), true, 'post cond');
    });

    test('when promises are pending', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      let promise = pauseTestFor(
        new RSVP.Promise(resolve => {
          setTimeout(() => {
            assert.strictEqual(isSettled(), false);

            resolve();

            setTimeout(() => {
              assert.strictEqual(isSettled(), true, 'post cond');

              done();
            });
          }, 100);
        })
      );

      assert.strictEqual(isSettled(), false);

      return promise;
    });
  });

  module('getSettledState', function() {
    test('when no work is scheduled, no requests, waiters completed', function(assert) {
      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: false,
        hasPendingWaiters: false,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: false,
        hasRunLoop: false,
        pendingRequestCount: 0,
      });
    });

    test('when work is scheduled via run.schedule', function(assert) {
      assert.expect(4);
      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      schedule('actions', this.confirmSettles(done));

      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: true,
        hasPendingWaiters: false,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: false,
        hasRunLoop: true,
        pendingRequestCount: 0,
      });
    });

    test('when work is scheduled via run.next', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      next(this.confirmSettles(done));

      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: true,
        hasPendingWaiters: false,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: false,
        hasRunLoop: false,
        pendingRequestCount: 0,
      });
    });

    test('when work is scheduled via run.later', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      later(this.confirmSettles(done), 15);

      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: true,
        hasPendingWaiters: false,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: false,
        hasRunLoop: false,
        pendingRequestCount: 0,
      });
    });

    test('when invocation is within a run loop', function(assert) {
      assert.expect(3);

      assert.strictEqual(isSettled(), true, 'precond');

      run(() => {
        assert.deepEqual(getSettledState(), {
          hasPendingRequests: false,
          hasPendingTimers: false,
          hasPendingWaiters: false,
          hasPendingTransitions: null,
          hasPendingPauseTestForPromises: false,
          hasRunLoop: true,
          pendingRequestCount: 0,
        });
      });

      assert.strictEqual(isSettled(), true, 'post cond');
    });

    test('when AJAX requests are pending', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      ajax('/whazzits').then(this.confirmSettles(done));

      /*
        When testing without jQuery `ajax` is provided by ember-fetch which uses a test waiter
        to ensure tests wait for pending `fetch` requests, but under jQuery.ajax we use global
        ajax start/stop timers
      */
      if (hasjQuery()) {
        assert.deepEqual(getSettledState(), {
          hasPendingRequests: true,
          hasPendingTimers: false,
          hasPendingWaiters: false,
          hasPendingTransitions: null,
          hasPendingPauseTestForPromises: false,
          hasRunLoop: false,
          pendingRequestCount: 1,
        });
      } else {
        assert.deepEqual(getSettledState(), {
          hasPendingRequests: false,
          hasPendingTimers: false,
          hasPendingWaiters: true,
          hasPendingTransitions: null,
          hasPendingPauseTestForPromises: false,
          hasRunLoop: false,
          pendingRequestCount: 0,
        });
      }
    });

    test('when waiters are pending', function(assert) {
      assert.expect(3);

      assert.strictEqual(isSettled(), true, 'precond');

      this.isWaiterPending = true;

      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: false,
        hasPendingWaiters: true,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: false,
        hasRunLoop: false,
        pendingRequestCount: 0,
      });

      this.isWaiterPending = false;

      assert.strictEqual(isSettled(), true, 'post cond');
    });

    test('when promises are pending', function(assert) {
      assert.expect(4);

      let done = assert.async();

      assert.strictEqual(isSettled(), true, 'precond');

      let promise = pauseTestFor(
        new RSVP.Promise(resolve => {
          setTimeout(() => {
            assert.strictEqual(isSettled(), false);

            resolve();

            setTimeout(() => {
              assert.strictEqual(isSettled(), true, 'post cond');

              done();
            });
          }, 100);
        })
      );

      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: false,
        hasPendingWaiters: false,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: true,
        hasRunLoop: false,
        pendingRequestCount: 0,
      });

      return promise;
    });
    test('all the things!', function(assert) {
      assert.expect(6);
      let done = assert.async();
      assert.strictEqual(isSettled(), true, 'precond');

      this.isWaiterPending = true;

      assert.deepEqual(getSettledState(), {
        hasPendingRequests: false,
        hasPendingTimers: false,
        hasPendingWaiters: true,
        hasPendingTransitions: null,
        hasPendingPauseTestForPromises: false,
        hasRunLoop: false,
        pendingRequestCount: 0,
      });

      run(() => {
        assert.deepEqual(getSettledState(), {
          hasPendingRequests: false,
          hasPendingTimers: false,
          hasPendingWaiters: true,
          hasPendingTransitions: null,
          hasPendingPauseTestForPromises: false,
          hasRunLoop: true,
          pendingRequestCount: 0,
        });

        next(this.confirmSettles(done));

        assert.deepEqual(getSettledState(), {
          hasPendingRequests: false,
          hasPendingTimers: true,
          hasPendingWaiters: true,
          hasPendingTransitions: null,
          hasPendingPauseTestForPromises: false,
          hasRunLoop: true,
          pendingRequestCount: 0,
        });

        this.isWaiterPending = false;
      });
    });
  });
});
