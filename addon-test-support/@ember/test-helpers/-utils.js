import { Promise } from 'rsvp';

export const nextTick = setTimeout;
export const futureTick = setTimeout;

export function nextTickPromise() {
  return new Promise(resolve => {
    nextTick(resolve);
  });
}

export function runDestroyablesFor(bucket, key) {
  let destroyables = bucket[key];

  if (!destroyables) {
    return;
  }

  for (let i = 0; i < destroyables.length; i++) {
    destroyables[i]();
  }

  delete bucket[key];
}
