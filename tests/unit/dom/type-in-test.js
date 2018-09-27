import { module, test } from 'qunit';
import { typeIn, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import { isIE11 } from '../../helpers/browser-detect';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

/*
 * Event order based on https://jsbin.com/zitazuxabe/edit?html,js,console,output
 */

let expectedEvents = [
  'focus',
  'focusin',
  'keydown',
  'keypress',
  'input',
  'keyup',
  'keydown',
  'keypress',
  'input',
  'keyup',
  'keydown',
  'keypress',
  'input',
  'keyup',
  'change',
];

if (isIE11) {
  expectedEvents = [
    'focusin',
    'keydown',
    'keypress',
    'keyup',
    'keydown',
    'keypress',
    'keyup',
    'keydown',
    'keypress',
    'keyup',
    'input',
    'change',
    'focus',
  ];
}

module('DOM Helper: typeIn', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function() {
    context = {};
  });

  hooks.afterEach(async function() {
    element.setAttribute('data-skip-steps', true);

    if (element) {
      element.parentNode.removeChild(element);
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('filling in an input', async function(assert) {
    element = buildInstrumentedElement('input');
    await typeIn(element, 'foo');

    assert.verifySteps(expectedEvents);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling in an input with a delay', async function(assert) {
    element = buildInstrumentedElement('input');
    await typeIn(element, 'foo', { delay: 150 });

    assert.verifySteps(expectedEvents);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling in a textarea', async function(assert) {
    element = buildInstrumentedElement('textarea');
    await typeIn(element, 'foo');

    assert.verifySteps(expectedEvents);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling in a non-fillable element', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(typeIn(`#${element.id}`, 'foo'), /`typeIn` is only usable on form controls/);
  });

  test('rejects if selector is not found', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      typeIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo'),
      /Element not found when calling `typeIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
    );
  });

  test('rejects if text to fill in is not provided', async function(assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(typeIn(element), /Must provide `text` when calling `typeIn`/);
  });

  test('does not run sync', async function(assert) {
    element = buildInstrumentedElement('input');

    let promise = typeIn(element, 'foo');

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(expectedEvents);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });
});
