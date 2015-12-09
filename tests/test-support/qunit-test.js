import Ember from 'ember';
import { getContext } from 'ember-test-helpers';

export default function test(testName, callback) {
  function wrapper() {
    var context = getContext();

    var result = callback.call(context);

    function failTestOnPromiseRejection(reason) {
      ok(false, reason);
    }

    Ember.run(function(){
      QUnit.stop();
      Ember.RSVP.Promise.cast(result)['catch'](failTestOnPromiseRejection)['finally'](QUnit.start);
    });
  }

  QUnit.test(testName, wrapper);
}
