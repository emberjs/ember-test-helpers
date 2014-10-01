import { TestModuleForModel } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleForModel(name, description, callbacks) {
  var module = new TestModuleForModel(name, description, callbacks);
  qunitModuleFor(module);
}

var Post = DS.Model.extend({
  title: DS.attr(),
  user: DS.attr(),
  comments: DS.hasMany('comment')
});
var Comment = DS.Model.extend({
  post: DS.belongsTo('post')
});

var PrettyColor = Ember.Component.extend({
  classNames: ['pretty-color'],
  attributeBindings: ['style'],
  style: function(){
    return 'color: ' + this.get('name') + ';';
  }.property('name')
});

var Whazzit = DS.Model.extend({ gear: DS.attr('string') });
var whazzitCreateRecordCalled = false;
var WhazzitAdapter = DS.FixtureAdapter.extend({
  createRecord: function(){
    whazzitCreateRecordCalled = true;
    return this._super.apply(this, arguments);
  }
});

var ApplicationAdapter = DS.FixtureAdapter.extend();

var registry = {
  'component:x-foo': Ember.Component.extend(),
  'component:pretty-color': PrettyColor,
  'template:components/pretty-color': Ember.Handlebars.compile('Pretty Color: <span class="color-name">{{name}}</span>'),
  'route:foo': Ember.Route.extend(),
  'controller:foos': Ember.ArrayController.extend(),
  'controller:hello-world': Ember.ObjectController.extend(),
  'controller:bar': Ember.Controller.extend({
    needs: ['foos', 'helloWorld']
  }),
  'model:post': Post,
  'model:comment': Comment,
  'model:whazzit': Whazzit,
  'adapter:whazzit': WhazzitAdapter,
  'adapter:application': ApplicationAdapter,
};

///////////////////////////////////////////////////////////////////////////////

moduleForModel('whazzit', 'model:whazzit without adapter', {
  preSetup: function() {
    setResolverRegistry(registry);
  }
});

test('store exists', function() {
  var store = this.store();
  ok(store instanceof DS.Store);
});

test('model exists as subject', function() {
  var model = this.subject();
  ok(model);
  ok(model instanceof DS.Model);
  ok(model instanceof Whazzit);
});

test('model is using the FixtureAdapter', function() {
  var model = this.subject(),
    store = this.store();

  ok(store.adapterFor(model.constructor) instanceof DS.FixtureAdapter);
  ok(!(store.adapterFor(model.constructor) instanceof WhazzitAdapter));
});

moduleForModel('whazzit', 'model:whazzit with custom adapter', {
  needs: ['adapter:whazzit'],
  teardown: function(){
    whazzitCreateRecordCalled = false;
  }
});

test('model is using the WhazzitAdapter', function() {
  var model = this.subject(),
    store = this.store();

  ok(store.adapterFor(model.constructor) instanceof WhazzitAdapter);
});

//TODO - model.save() promise is never fulfilled
//       (broken on this branch as well as on master)
//
// if (DS._setupContainer) {
//   test('creates the custom adapter', function() {
//     expect(2);
//     ok(!whazzitCreateRecordCalled, 'precond - custom adapter is not yet instantiated');
//
//     var model = this.subject();
//
//     return Ember.run(function(){
//       model.set('gear', '42');
//       return model.save().then(function(){
//         ok(whazzitCreateRecordCalled, 'uses the custom adapter');
//       });
//     });
//   });
// } else {
//   test('without DS._setupContainer fails to create the custom adapter', function() {
//     var thrown = false;
//     try {
//       var model = this.subject();
//       Ember.run(function(){
//         model.set('gear', '42');
//         return model.save();
//       });
//     } catch(e) {
//       thrown = true;
//     }
//     ok(thrown, 'error is thrown without DS._setupContainer');
//   });
// }

moduleForModel('whazzit', 'model:whazzit with application adapter', {
  preSetup: function() {
    setResolverRegistry(registry);
  },
  needs: ['adapter:application']
});

test('model is using the ApplicationAdapter', function() {
  var model = this.subject(),
    store = this.store();

  ok(store.adapterFor(model.constructor) instanceof ApplicationAdapter);
  ok(!(store.adapterFor(model.constructor) instanceof WhazzitAdapter));
});
