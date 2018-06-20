import { Promise } from 'rsvp';
import { futureTick } from '../-utils';
import { getRootElement } from './get-root-element';
import getElement from './-get-element';


/**
  Wait for element to be visible inside of given root element (defaults to testing container)

  @public
  @param {string|Element} target the selector or element for the element that visibility will be calculated on
  @param {Object} [options] options used to override defaults
  @param {number} [options.timeout=1000] the maximum amount of time to wait
  @param {string|Element} [options.root='test container'] the selector for the element whose bounding box will be intersected with the target element. Defaults to the value of getRootElement()
  @param {number} [options.threshold=1.0] the percentage of visibility required for this helper to resolve
  @param {string} [options.rootMargin='0px 0px 0px 0px'] offsets to be added to the sides of the root element bounding box before calculating intersection
  @param {string} [options.timeoutMessage='visible timed out'] the message to use in the reject on timeout

  @returns {Promise} resolves with the callback value when it returns a truthy value
*/
export default function visible(target, options = {}) {
  let root = 'rootSelector' in options ? options.root : getRootElement();
  let threshold = 'threshold' in options ? options.threshold : 1.0;
  let rootMargin = 'rootMargin' in options ? options.rootMargin : '0px 0px 0px 0px';
  let timeout = 'timeout' in options ? options.timeout : 1000;
  let timeoutMessage = 'timeoutMessage' in options ? options.timeoutMessage : 'visible timed out';

  root = typeof(root) == "string" ? getElement(root) : root;
  if(!root) throw new Error('Provided root element does not exist');

  target = typeof(target) == "string" ? getElement(target) : target;
  if(!target) throw new Error('Provided target element does not exist');

  // creating this error eagerly so it has the proper invocation stack
  let waitTimedOut = new Error(timeoutMessage);

  return new Promise(function(resolve, reject) {
    function observerCallback (entries, observer) {
      if(entries[0].intersectionRatio >= threshold) {
        observer.disconnect();
        resolve(target);
      }
    };

    var intersectionObserver = new IntersectionObserver(observerCallback,
      {'root': root, 'threshold': threshold, 'rootMargin': rootMargin});
    intersectionObserver.observe(target);

    futureTick(function() {
      intersectionObserver.disconnect();
      reject(waitTimedOut);
    }, timeout);
  });
}


