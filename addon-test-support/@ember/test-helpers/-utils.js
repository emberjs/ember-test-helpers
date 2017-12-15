import { Promise } from 'rsvp';

export const nextTick = setTimeout;

export function nextTickPromise() {
  return new Promise(resolve => {
    nextTick(resolve);
  });
}
