import { Promise } from 'rsvp';

import legacyBuildRegistry from 'ember-test-helpers/legacy-0-6-x/build-registry';

export default function({ application, resolver }) {
  if (application) {
    return application.boot().then(app => app.buildInstance().boot());
  }

  if (!resolver) {
    throw new Error(
      'You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.'
    );
  }

  let { owner } = legacyBuildRegistry(resolver);
  return Promise.resolve(owner);
}
