import { resolve } from 'rsvp';
import { setTesting } from '@ember/debug';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { setResolverRegistry } from './resolver';
import QUnitTestAdapter from './qunit-test-adapter';
import { setAdapter } from 'ember-testing/lib/setup_for_testing';

export default function (name, options = {}) {
  module(name, {
    beforeEach() {
      setAdapter(QUnitTestAdapter.create());

      if (options.registry) {
        setResolverRegistry(options.registry);
      }

      let testElementContainer = document.querySelector(
        '#ember-testing-container'
      );
      this.fixtureResetValue = testElementContainer.innerHTML;

      setTesting(true);
      this.application = startApp();

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      let afterEach =
        options.afterEach && options.afterEach.apply(this, arguments);
      return resolve(afterEach)
        .then(() => destroyApp(this.application))
        .finally(() => {
          setTesting(false);

          document.getElementById('ember-testing-container').innerHTML =
            this.fixtureResetValue;
        });
    },
  });
}
