import { module, test } from 'qunit';
import { findAll, setupContext, teardownContext } from '@ember/test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: findAll', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element1, element2, child1, child2, child3, child4;
  const createDiv = () => document.createElement('div'),
    setupElements = index => {
      let parent = createDiv(),
        children = [createDiv(), createDiv()];
      parent.setAttribute('id', `elt-${index}`);
      children.forEach(child => {
        child.classList.add('my-class');
        parent.appendChild(child);
      });
      return [parent, ...children];
    },
    checkResult = (assert, result, elements) => {
      assert.ok(result instanceof Array);
      assert.equal(result.length, elements.length);
      elements.forEach((element, index) => {
        assert.equal(result[index], element);
      });
    };

  hooks.beforeEach(function() {
    context = {};
    [element1, child1, child2] = setupElements(1);
    [element2, child3, child4] = setupElements(2);
  });

  hooks.afterEach(async function() {
    [element1, element2].forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
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

    let result = findAll('.my-class');
    checkResult(assert, result, [child1, child2, child3, child4]);

    result = findAll('.my-class', '#elt-2');
    checkResult(assert, result, [child3, child4]);

    result = findAll('.my-class', element2);
    checkResult(assert, result, [child3, child4]);
  });

  test('does not match outside test container', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    fixture.appendChild(element1);
    fixture.parentNode.appendChild(element2);

    let result = findAll('.my-class');
    checkResult(assert, result, [child1, child2]);
  });

  test('throws without context set', function(assert) {
    assert.throws(() => {
      findAll('#foo');
    }, /Must setup rendering context before attempting to interact with elements/);
  });
});
