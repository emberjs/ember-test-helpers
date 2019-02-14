/*
  This is the production version of `pauseTestFor`, the "real" implementation
  is in addon-test-support/@ember/test-helpers/settled.ts.

  This is a simple pass through function...
*/
export function pauseTestFor(promise) {
  return promise;
}
