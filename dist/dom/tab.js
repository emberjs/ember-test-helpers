import getRootElement from './get-root-element.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import fireEvent, { _buildKeyboardEvent } from './fire-event.js';
import { isDocument } from './-target.js';
import { __blur__ } from './blur.js';
import { __focus__ } from './focus.js';
import { isVisible, isDisabled } from '../-utils.js';
import { registerHook, runHooks } from '../helper-hooks.js';
import { log } from './-logging.js';

const SUPPORTS_INERT = 'inert' in Element.prototype;
const FALLBACK_ELEMENTS = ['CANVAS', 'VIDEO', 'PICTURE'];
registerHook('tab', 'start', target => {
  log('tab', target);
});

/**
  Gets the active element of a document. IE11 may return null instead of the body as
  other user-agents does when there isn’t an active element.
  @private
  @param {Document} ownerDocument the element to check
  @returns {HTMLElement} the active element of the document
*/
function getActiveElement(ownerDocument) {
  return ownerDocument.activeElement || ownerDocument.body;
}
/**
  Compiles a list of nodes that can be focused. Walks the tree, discards hidden elements and a few edge cases. To calculate the right.
  @private
  @param {Element} root the root element to start traversing on
  @returns {Array} list of focusable nodes
*/
function compileFocusAreas(root = document.body) {
  const {
    ownerDocument
  } = root;
  if (!ownerDocument) {
    throw new Error('Element must be in the DOM');
  }
  const activeElement = getActiveElement(ownerDocument);
  const treeWalker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: node => {
      // Only visible nodes can be focused, with, at least, one exception; the "area" element.
      // reference: https://html.spec.whatwg.org/multipage/interaction.html#data-model
      if (node.tagName !== 'AREA' && isVisible(node) === false) {
        return NodeFilter.FILTER_REJECT;
      }

      // Reject any fallback elements. Fallback elements’s children are only rendered if the UA
      // doesn’t support the element. We make an assumption that they are always supported, we
      // could consider feature detecting every node type, or making it configurable.
      const parentNode = node.parentNode;
      if (parentNode && FALLBACK_ELEMENTS.indexOf(parentNode.tagName) !== -1) {
        return NodeFilter.FILTER_REJECT;
      }

      // Rejects inert containers, if the user agent supports the feature (or if a polyfill is installed.)
      if (SUPPORTS_INERT && node.inert) {
        return NodeFilter.FILTER_REJECT;
      }
      if (isDisabled(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      // Always accept the 'activeElement' of the document, as it might fail the next check, elements with tabindex="-1"
      // can be focused programmatically, we'll therefor ensure the current active element is in the list.
      if (node === activeElement) {
        return NodeFilter.FILTER_ACCEPT;
      }

      // UA parses the tabindex attribute and applies its default values, If the tabIndex is non negative, the UA can
      // focus it.
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  let node;
  const elements = [];
  while (node = treeWalker.nextNode()) {
    elements.push(node);
  }
  return elements;
}

/**
  Sort elements by their tab indices.
  As older browsers doesn't necessarily implement stabile sort, we'll have to
  manually compare with the index in the original array.
  @private
  @param {Array<HTMLElement>} elements to sort
  @returns {Array<HTMLElement>} list of sorted focusable nodes by their tab index
*/
function sortElementsByTabIndices(elements) {
  return elements.map((element, index) => {
    return {
      index,
      element
    };
  }).sort((a, b) => {
    if (a.element.tabIndex === b.element.tabIndex) {
      return a.index - b.index;
    } else if (a.element.tabIndex === 0 || b.element.tabIndex === 0) {
      return b.element.tabIndex - a.element.tabIndex;
    }
    return a.element.tabIndex - b.element.tabIndex;
  }).map(entity => entity.element);
}

/**
  @private
  @param {Element} root The root element or node to start traversing on.
  @param {HTMLElement} activeElement The element to find the next and previous focus areas of
  @returns {object} The next and previous focus areas of the active element
 */
function findNextResponders(root, activeElement) {
  const focusAreas = compileFocusAreas(root);
  const sortedFocusAreas = sortElementsByTabIndices(focusAreas);
  const elements = activeElement.tabIndex === -1 ? focusAreas : sortedFocusAreas;
  const index = elements.indexOf(activeElement);
  if (index === -1) {
    return {
      next: sortedFocusAreas[0],
      previous: sortedFocusAreas[sortedFocusAreas.length - 1]
    };
  }
  return {
    next: elements[index + 1],
    previous: elements[index - 1]
  };
}

/**
  Emulates the user pressing the tab button.

  Sends a number of events intending to simulate a "real" user pressing tab on their
  keyboard.

  @public
  @param {Object} [options] optional tab behaviors
  @param {boolean} [options.backwards=false] indicates if the the user navigates backwards
  @param {boolean} [options.unRestrainTabIndex=false] indicates if tabbing should throw an error when tabindex is greater than 0
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating pressing the `TAB` key
  </caption>
  tab();

  @example
  <caption>
    Emulating pressing the `SHIFT`+`TAB` key combination
  </caption>
  tab({ backwards: true });
*/
function triggerTab({
  backwards = false,
  unRestrainTabIndex = false
} = {}) {
  return Promise.resolve().then(() => {
    return triggerResponderChange(backwards, unRestrainTabIndex);
  }).then(() => {
    return settled();
  });
}

/**
  @private
  @param {boolean} backwards when `true` it selects the previous focus area
  @param {boolean} unRestrainTabIndex when `true`, will not throw an error if tabindex > 0 is encountered
  @returns {Promise<void>} resolves when all events are fired
 */
function triggerResponderChange(backwards, unRestrainTabIndex) {
  const root = getRootElement();
  let ownerDocument;
  let rootElement;
  if (isDocument(root)) {
    rootElement = root.body;
    ownerDocument = root;
  } else {
    rootElement = root;
    ownerDocument = root.ownerDocument;
  }
  const keyboardEventOptions = {
    keyCode: 9,
    which: 9,
    key: 'Tab',
    code: 'Tab',
    shiftKey: backwards
  };
  const debugData = {
    keyboardEventOptions,
    ownerDocument,
    rootElement
  };
  return Promise.resolve().then(() => runHooks('tab', 'start', debugData)).then(() => getActiveElement(ownerDocument)).then(activeElement => runHooks('tab', 'targetFound', activeElement).then(() => activeElement)).then(activeElement => {
    const event = _buildKeyboardEvent('keydown', keyboardEventOptions);
    const defaultNotPrevented = activeElement.dispatchEvent(event);
    if (defaultNotPrevented) {
      // Query the active element again, as it might change during event phase
      activeElement = getActiveElement(ownerDocument);
      const target = findNextResponders(rootElement, activeElement);
      if (target) {
        if (backwards && target.previous) {
          return __focus__(target.previous);
        } else if (!backwards && target.next) {
          return __focus__(target.next);
        } else {
          return __blur__(activeElement);
        }
      }
    }
    return Promise.resolve();
  }).then(() => {
    const activeElement = getActiveElement(ownerDocument);
    return fireEvent(activeElement, 'keyup', keyboardEventOptions).then(() => activeElement);
  }).then(activeElement => {
    if (!unRestrainTabIndex && activeElement.tabIndex > 0) {
      throw new Error(`tabindex of greater than 0 is not allowed. Found tabindex=${activeElement.tabIndex}`);
    }
  }).then(() => runHooks('tab', 'end', debugData));
}

export { triggerTab as default };
//# sourceMappingURL=tab.js.map
