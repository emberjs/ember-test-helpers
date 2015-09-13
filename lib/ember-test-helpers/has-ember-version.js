import Ember from 'ember';

export default function hasEmberVersion(major, minor) {
  var numbers = Ember.VERSION.split('-')[0].split('.');
  var actualMajor = parseInt(numbers[0], 10);
  var actualMinor = parseInt(numbers[1], 10);
  return actualMajor > major || (actualMajor === major && actualMinor >= minor);
}
