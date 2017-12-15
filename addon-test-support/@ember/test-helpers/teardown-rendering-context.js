import { guidFor } from '@ember/object/internals';
import { RENDERING_CLEANUP } from './setup-rendering-context';
import { nextTickPromise, runDestroyablesFor } from './-utils';
import settled from './settled';

export default function(context) {
  return nextTickPromise().then(() => {
    let contextGuid = guidFor(context);

    runDestroyablesFor(RENDERING_CLEANUP, contextGuid);

    return settled();
  });
}
