import Ember from 'ember';

/**
  Checks if the currently running Ember version is greater than or equal to the
  specified major and minor version numbers.

  @private
  @param {number} major the major version number to compare
  @param {number} minor the minor version number to compare
  @returns {boolean} true if the Ember version is >= MAJOR.MINOR specified, false otherwise
*/
export default function hasEmberVersion(major, minor) {
  let numbers = Ember.VERSION.split('-')[0]?.split('.');
  if (!numbers || !numbers[0] || !numbers[1]) {
    throw new Error('`Ember.VERSION` is not set.');
  }
  let actualMajor = parseInt(numbers[0], 10);
  let actualMinor = parseInt(numbers[1], 10);
  return actualMajor > major || actualMajor === major && actualMinor >= minor;
}