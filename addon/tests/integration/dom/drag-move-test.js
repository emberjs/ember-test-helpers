import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import {
  dragMove,
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
      <div draggable='true' class='source' {{on 'dragstart' this.handleDragStart}}>Test draggable text</div>
      <div class='target'
        {{on "dragover" this.handleDragOver}}
        {{on "dragenter" this.handleDragEnter}}
        {{on "drop" this.handleDrop}}
        >Drag text here</div>
      `);

    debugger;

    await dragMove('.source', '.target');

    assert.true(this.get('dragStarted'));
    assert.true(this.get('dragenterTriggered'));
    assert.true(this.get('dragoverTriggered'));
    assert.true(this.get('dropTriggered'));
  });
});
