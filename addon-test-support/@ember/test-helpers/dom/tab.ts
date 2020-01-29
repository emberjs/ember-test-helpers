import getRootElement from './get-root-element';
import settled from '../settled';
import { buildKeyboardEvent } from './fire-event';
import { isDocument } from './-target';
import { __blur__ } from './blur';
import { nextTickPromise } from '../-utils';
import { createTreeWalker } from './-create-tree-walker';

const FORM_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'FIELDSET'];
const SUPPORTS_INHERT = Element.prototype.hasOwnProperty('inert');
const FALLBACK_ELEMENTS = ['CANVAS', 'VIDEO', 'PICTURE'];

function isVisible(element: HTMLElement): boolean {
  let styles = window.getComputedStyle(element);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

function isDisabled(element: HTMLElement): boolean {
  if (FORM_TAGS.indexOf(element.tagName) !== -1) {
    return (element as HTMLInputElement).disabled;
  }
  return false;
}

interface InhertHTMLElement extends HTMLElement {
  inhert: boolean;
}

// Compiles a list of nodes that can be focued. Walkes the tree, discardes hidden
// elements and a few edge cases. To calculate the right
function compileFocusAreas(root: Element = document.body) {
  let activeElment = getActiveElement(root.ownerDocument!);
  let treeWalker = createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: HTMLElement) => {
        /// Only visible nodes can be focused, with, at least, one exception; the "area" element.
        if (node.tagName !== 'AREA' && isVisible(node) === false) {
          return NodeFilter.FILTER_REJECT;
        }

        // Reject any fallback elements. Fallback elements’s children are only rendered if the UA
        // doesn’t support the element. We make an assumption that they are always supported, we
        // could consider feature detecting every node type, or making it configurable.
        let parentNode = node.parentNode as HTMLElement | null;
        if (parentNode && FALLBACK_ELEMENTS.indexOf(parentNode.tagName) !== -1) {
          return NodeFilter.FILTER_REJECT;
        }

        // Rejects inhert containers, if the user agent supports the feature (or if a polyfill is installed.)
        if (SUPPORTS_INHERT && (node as InhertHTMLElement).inhert) {
          return NodeFilter.FILTER_REJECT;
        }

        if (isDisabled(node)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Always accept the 'activeElement' of the document, as it might fail the next check, elements with tabindex="-1"
        // can be focused programtically, we'll therefor ensure the current active element is in the list.
        if (node === activeElment) {
          return NodeFilter.FILTER_ACCEPT;
        }

        // UA parses the tabindex attribute and applies its default values, If the tabIndex is non negative, the UA can
        // foucs it.
        return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    },
    false
  );

  let node: Node | null;
  let elements: HTMLElement[] = [];

  while ((node = treeWalker.nextNode())) {
    elements.push(node as HTMLElement);
  }

  return elements;
}

// Sort elements by tab indices, as older browsers doesn't necesarrly implement stabile sort,
// we'll have to manually compare with the index in the original array.
function sortElementsByTabIndices(elements: HTMLElement[]): HTMLElement[] {
  return elements
    .map((element, index) => {
      return { index, element };
    })
    .sort((a, b) => {
      if (a.element.tabIndex === b.element.tabIndex) {
        return a.index - b.index;
      } else if (a.element.tabIndex === 0 || b.element.tabIndex === 0) {
        return b.element.tabIndex - a.element.tabIndex;
      }
      return a.element.tabIndex - b.element.tabIndex;
    })
    .map(entity => entity.element);
}

function findNextResponders(root: Element, element: HTMLElement) {
  let focusAreas = compileFocusAreas(root);
  let sortedFocusAreas = sortElementsByTabIndices(focusAreas);
  let elements = element.tabIndex === -1 ? focusAreas : sortedFocusAreas;

  let index = elements.indexOf(element);
  if (index === -1) {
    return {
      next: sortedFocusAreas[0],
      previous: sortedFocusAreas[sortedFocusAreas.length - 1],
    };
  }

  return {
    next: elements[index + 1],
    previous: elements[index - 1],
  };
}

/**
  Emulates the user pressing the tab button.

  Sends a number of events intending to simulate a "real" user pressing tab on their
  keyboard.

  @public
  @param {Object} options {backwards: x} (default false) indicates if the the user navigates backwards
  @return {Promise<void>} resolves when settled

  @example
  tab();
  tab({backwards: true});
*/
export default function triggerTab(options?: { backwards: boolean }): Promise<void> {
  return nextTickPromise().then(() => {
    let backwards = (options && options.backwards) || false;
    triggerResponderChange(backwards);
    return settled();
  });
}

function getActiveElement(ownerDocument: Document): HTMLElement {
  return (ownerDocument.activeElement as HTMLElement) || ownerDocument.body;
}

function triggerResponderChange(backwards: boolean) {
  let root = getRootElement();
  let ownerDocument: Document;
  let rootElement: HTMLElement;
  if (isDocument(root)) {
    rootElement = root.body;
    ownerDocument = root;
  } else {
    rootElement = root as HTMLElement;
    ownerDocument = root.ownerDocument as Document;
  }

  let activeElement = getActiveElement(ownerDocument);

  let event = buildKeyboardEvent('keydown', {
    keyCode: 9,
    which: 9,
    key: 'Tab',
    code: 'Tab',
    shiftKey: backwards,
  });
  let defaultNotPrevented = activeElement.dispatchEvent(event);

  if (defaultNotPrevented) {
    // Query the active element again, as it might change during event phase
    activeElement = getActiveElement(ownerDocument);
    let target = findNextResponders(rootElement, activeElement);
    if (target) {
      if (backwards && target.previous) {
        target.previous.focus();
      } else if (!backwards && target.next) {
        target.next.focus();
      } else {
        __blur__(activeElement);
      }
    }
  }
}
