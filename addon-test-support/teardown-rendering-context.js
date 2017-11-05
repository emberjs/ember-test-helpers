import { guidFor } from '@ember/object/internals';
import { run, next } from '@ember/runloop';
import { Promise } from 'rsvp';
import { RENDERING_CLEANUP } from './setup-rendering-context';

export default function(context) {
  return new Promise(resolve => {
    // ensure "real" async and not "fake" RSVP based async
    next(() => {
      let guid = guidFor(context);
      let destroyables = RENDERING_CLEANUP[guid];

      for (let i = 0; i < destroyables.length; i++) {
        run(destroyables[i]);
      }

      delete RENDERING_CLEANUP[guid];
      resolve(context);
    });
  });
}
