import Ember from 'ember';

export default function wait() {
  return new Ember.RSVP.Promise(function(resolve) {
    var watcher = self.setInterval(function() {
      // If there are scheduled timers or we are inside of a run loop, keep polling
      if (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop) {
        return;
      }

      // Stop polling
      self.clearInterval(watcher);

      // Synchronously resolve the promise
      Ember.run(null, resolve);
    }, 10);
  });
}
