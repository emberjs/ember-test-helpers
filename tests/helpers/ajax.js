import hasjQuery from '../helpers/has-jquery';
import $ from 'jquery'; // FYI - not present in all scenarios
import require from 'require';

export default function ajax(url) {
  if (hasjQuery()) {
    return $.ajax(url, { cache: false });
  } else {
    let fetch = require('fetch').default;
    return fetch(url).then(response => response.text());
  }
}
