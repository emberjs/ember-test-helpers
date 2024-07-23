import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import {
  dragMove,
  find,
  render,
  setupContext,
  setupRenderingContext,
  teardownContext,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

module('DOM Helper: moveDrag', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(async function () {
    await teardownContext(this);
  });

  test('Drag and drop triggers native events', async function (assert) {
    this.set('dragstartTriggered', false);
    this.set('dragoverTriggered', false);
    this.set('dragenterTriggered', false);
    this.set('dropTriggered', false);

    this.set('handleDragStart', () => {
      this.set('dragStarted', true);
    });
    this.set('handleDragOver', (event) => {
      // Per docs, you should prevent default on over and enter in order
      // for drop zone to be a valid target
      event.preventDefault();
      this.set('dragoverTriggered', true);
    });
    this.set('handleDragEnter', (event) => {
      event.preventDefault();
      this.set('dragenterTriggered', true);
    });
    this.set('handleDrop', () => {
      console.log('dropped');
      this.set('dropTriggered', true);
    });

    await render(hbs`
      <div draggable='true' class='source'>Test draggable text</div>
      <div class='target'>Drag text here</div>
      `);

    /* The below addEventListeners are used because Ember 3.8 did not have the `on` helper, and
     * this test errors in ember-test-helpers github ci.
     *
     * This is how the dom rendering above would loook like with modern ember templates:
     *
     * <div draggable='true' class='source' {{on 'dragstart' this.handleDragStart}}>Test draggable text</div>
     * <div class='target'
     *   {{on "dragover" this.handleDragOver}}
     *   {{on "dragenter" this.handleDragEnter}}
     *   {{on "drop" this.handleDrop}}
     *   >Drag text here</div>
     */
    const sourceEl = find('.source');
    sourceEl.addEventListener('dragstart', this.handleDragStart);
    const targetEl = find('.target');
    targetEl.addEventListener('drop', this.handleDrop);
    targetEl.addEventListener('dragover', this.handleDragOver);
    targetEl.addEventListener('dragenter', this.handleDragEnter);

    await dragMove('.source', '.target');

    assert.true(this.get('dragStarted'));
    assert.true(this.get('dragenterTriggered'));
    assert.true(this.get('dragoverTriggered'));
    assert.true(this.get('dropTriggered'));
  });

  test('dataTransfer mock transfers data like html api', async function (assert) {
    const testString = 'Test string!';

    this.set('handleDragStart', (event) => {
      event.dataTransfer.setData('test', testString);
    });
    this.set('handleDragOver', (event) => {
      event.preventDefault();
    });
    this.set('handleDragEnter', (event) => {
      event.preventDefault();
    });
    this.set('handleDrop', (event) => {
      const payload = event.dataTransfer.getData('test');

      this.set('deliveredPayload', payload);
    });

    await render(hbs`
      <div draggable='true' class='source'>Test draggable text</div>
      <div class='target'>Drag text here</div>
      `);

    const sourceEl = find('.source');
    sourceEl.addEventListener('dragstart', this.handleDragStart);
    const targetEl = find('.target');
    targetEl.addEventListener('drop', this.handleDrop);
    targetEl.addEventListener('dragover', this.handleDragOver);
    targetEl.addEventListener('dragenter', this.handleDragEnter);

    await dragMove('.source', '.target');

    assert.equal(testString, this.get('deliveredPayload'));
  });
});
