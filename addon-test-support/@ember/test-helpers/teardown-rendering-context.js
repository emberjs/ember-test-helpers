import { guidFor } from '@ember/object/internals';
import { run } from '@ember/runloop';
import { RENDERING_CLEANUP } from './setup-rendering-context';
import { nextTickPromise } from './-utils';
import settled from './settled';

export default function(context) {
  return nextTickPromise().then(() => {
    let guid = guidFor(context);
    let destroyables = RENDERING_CLEANUP[guid];

    for (let i = 0; i < destroyables.length; i++) {
      run(destroyables[i]);
    }

    delete RENDERING_CLEANUP[guid];

    return settled();
  });
}
