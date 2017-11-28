import Ember from 'ember';
const VALID = Object.freeze({ isValid: true, message: null });
const INVALID = Object.freeze({
  isValid: false,
  message: 'error handler should have re-thrown the provided error',
});

export default function(callback = Ember.onerror) {
  if (callback === undefined || callback === null) {
    return VALID;
  }

  let error = new Error('Error handler validation error!');

  let originalEmberTesting = Ember.testing;
  Ember.testing = true;
  try {
    callback(error);
  } catch (e) {
    if (e === error) {
      return VALID;
    }
  } finally {
    Ember.testing = originalEmberTesting;
  }

  return INVALID;
}
