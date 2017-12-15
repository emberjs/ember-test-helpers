import getElement from './-get-element';
import fireEvent from './fire-event';
import { __click__ } from './click';
import settled from '../settled';
import { nextTickPromise } from '../-utils';

/*
  @method tap
  @param {String|Element} target
  @param {Object} options
  @return {Promise}
  @public
*/
export default function tap(target, options = {}) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `tap`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`tap('${target}')\`.`);
    }

    let touchstartEv = fireEvent(element, 'touchstart', options);
    let touchendEv = fireEvent(element, 'touchend', options);

    if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
      __click__(element);
    }

    return settled();
  });
}
