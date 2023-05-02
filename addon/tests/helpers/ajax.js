/* globals jQuery */
import { Promise } from 'rsvp';
import hasjQuery from '../helpers/has-jquery';
import { join } from '@ember/runloop';
import { waitForPromise } from '@ember/test-waiters';

export default function ajax(url) {
  if (hasjQuery()) {
    return new Promise((resolve, reject) => {
      jQuery.ajax(url, {
        success: resolve,
        error(reason) {
          join(null, reject, reason);
        },
        cache: false,
      });
    });
  } else {
    return waitForPromise(fetch(url).then((response) => response.text()));
  }
}
