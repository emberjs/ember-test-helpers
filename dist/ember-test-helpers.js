define("ember-test-helpers",
  ["exports"],
  function(__exports__) {
    "use strict";
    function exists(selector) {
      return !!window.find(selector).length;
    }

    __exports__.exists = exists;
  });
