/* globals jQuery */
import { Promise } from 'rsvp';
import hasjQuery from '../helpers/has-jquery';
import require from 'require';
import { join } from '@ember/runloop';

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
    let fetch = require('fetch').default;
    return fetch(url).then((response) => response.text());
  }
}
