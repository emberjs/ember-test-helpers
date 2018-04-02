import { module, test } from 'qunit';
import { find, setupContext, teardownContext } from '@ember/test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: find', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element1, element2, child1, child2;
  const createDiv = () => document.createElement('div'),
    setupElements = index => {
      let parent = createDiv(),
        child = createDiv();
      parent.setAttribute('id', `elt-${index}`);
      child.classList.add('my-class');
      parent.appendChild(child);
      return [parent, child];
    };

  hooks.beforeEach(function() {
    context = {};
    [element1, child1] = setupElements(1);
    [element2, child2] = setupElements(2);
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

    assert.equal(find('#elt-1'), element1);
    assert.equal(find('.my-class'), child1);
    assert.equal(find('.my-class', '#elt-2'), child2);
    assert.equal(find('.my-class', element2), child2);
  });

  test('does not match outside test container', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    fixture.parentNode.appendChild(element1);

    assert.notOk(find('#elt-1'));
  });

  test('throws without context set', function(assert) {
    assert.throws(() => {
      find('#foo');
    }, /Must setup rendering context before attempting to interact with elements/);
  });
});
