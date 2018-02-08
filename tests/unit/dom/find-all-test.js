import { module, test } from 'qunit';
import { findAll, setupContext, teardownContext } from '@ember/test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: findAll', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element1, element2;

  hooks.beforeEach(function() {
    context = {};
    element1 = document.createElement('div');
    element1.classList.add('elt');
    element2 = document.createElement('div');
    element2.classList.add('elt');
  });

  hooks.afterEach(async function() {
    if (element1.parentNode) {
      element1.parentNode.removeChild(element1);
    }
    if (element2.parentNode) {
      element2.parentNode.removeChild(element2);
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('works with context set', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    fixture.appendChild(element1);
    fixture.appendChild(element2);

    let result = findAll('.elt');
    assert.ok(result instanceof Array);
    assert.equal(result.length, 2);
    assert.equal(result[0], element1);
    assert.equal(result[1], element2);
  });

  test('does not match outside test container', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    fixture.appendChild(element1);
    fixture.parentNode.appendChild(element2);

    let result = findAll('.elt');
    assert.ok(result instanceof Array);
    assert.equal(result.length, 1);
    assert.equal(result[0], element1);
  });

  test('works if an ancestor is passed', async function(assert) {
    await setupContext(context);
    let selector = 'my-unique-class';
    let resultCount = 3;

    let fixture = document.querySelector('#ember-testing');
    element1.classList.add(selector);
    fixture.appendChild(element1);
    element2.classList.add(selector);
    fixture.appendChild(element2);
    let ancestor = document.createElement('span');
    for (let i = 0; i < resultCount; i++) {
      let validResult = document.createElement('div');
      validResult.classList.add(selector);
      ancestor.appendChild(validResult);
    }
    fixture.appendChild(ancestor);

    let resultElements = findAll(`.${selector}`, ancestor);
    assert.equal(resultElements.length, resultCount);
    assert.notOk(resultElements.includes(element1));
    assert.notOk(resultElements.includes(element2));
  });

  test('throws without context set', function(assert) {
    assert.throws(() => {
      findAll('#foo');
    }, /Must setup rendering context before attempting to interact with elements/);
  });
});
