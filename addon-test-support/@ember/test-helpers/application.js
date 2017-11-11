import { getResolver, setResolver } from './resolver';

var __application__;

export function setApplication(application) {
  __application__ = application;

  if (!getResolver()) {
    let Resolver = application.Resolver;
    let resolver = Resolver.create({ namespace: application });

    setResolver(resolver);
  }
}

export function getApplication() {
  return __application__;
}
