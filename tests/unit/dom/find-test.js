import { module, test } from 'qunit';
import { find, setupContext, teardownContext } from '@ember/test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: find', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function() {
    context = {};
    element = document.createElement('div');
    element.setAttribute('id', 'elt');
  });

  hooks.afterEach(async function() {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('works with context set', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    fixture.appendChild(element);

    assert.equal(find('#elt'), element);
  });

  test('does not match outside test container', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    fixture.parentNode.appendChild(element);

    assert.notOk(find('#elt'));
  });

  test('works if an ancestor is passed', async function(assert) {
    await setupContext(context);
    let selector = 'my-unique-class';

    let fixture = document.querySelector('#ember-testing');
    element.classList.add(selector);
    fixture.appendChild(element);
    let ancestor = document.createElement('span');
    let validResult = document.createElement('div');
    validResult.classList.add(selector);
    ancestor.appendChild(validResult);
    fixture.appendChild(ancestor);

    assert.equal(find(`.${selector}`, ancestor), validResult);
  });

  test('throws without context set', function(assert) {
    assert.throws(() => {
      find('#foo');
    }, /Must setup rendering context before attempting to interact with elements/);
  });
});
