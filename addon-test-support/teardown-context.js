import { run } from '@ember/runloop';
import { _teardownPromiseListeners } from './ext/rsvp';
import { _teardownAJAXHooks } from './settled';
import Ember from 'ember';

export default function(context) {
  let { owner } = context;

  _teardownPromiseListeners();
  _teardownAJAXHooks();

  run(owner, 'destroy');
  Ember.testing = false;
}
