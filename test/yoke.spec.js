/**
 * Created by Rytis on 2016-07-28.
 */
var expect  = require('chai').expect;
var sinon   = require('sinon');

var yoke = require('../yoke');
describe('yoke binder: ', function() {

  it('should create bound function', function() {

    function add(arg1) {
      return this + arg1;
    }

    expect(yoke(add, 2)(2)).to.equal(4);

  });

  // binding support flag is initiated on yoke initialization, so there is no way to test it after it's loaded.
  // But I tried it by setting it to dynamic check and it worked. Trust me :)
  xit('should create bound function when native binding not supported (to run this case, yoke code has to be modified)', function() {

    function add(arg1) {
      return this + arg1;
    }

    var origBind = Function.prototype.bind;
    Function.prototype.bind = undefined;

    expect(yoke(add, 2)(2)).to.equal(4);
    expect(Function.prototype.bind).to.be.equal(undefined);
    Function.prototype.bind = origBind;

  });

  it('should reuse bound function', function() {

    function add(arg1) {
      return this + arg1;
    }

    var boundAdd2_1 = yoke(add, 2);
    var boundAdd2_2 = yoke(add, 2);

    expect(boundAdd2_1).to.be.equal(boundAdd2_2);

  });

  it('should not reuse binding if arguments are different', function() {

    function add(arg1) {
      return this + arg1;
    }

    var boundAdd2and3 = yoke(add, 2, 3);
    var boundAdd2and4 = yoke(add, 2, 4);
    var boundAdd2and4_2 = yoke(add, 2, 4);

    expect(boundAdd2and3).to.be.not.equal(boundAdd2and4);
    expect(boundAdd2and4).to.be.equal(boundAdd2and4_2);
  });

  it('should warn if global object or `undefined` is used as context', function() {

    function Some() {
      return this;
    }

    sinon.spy(console, 'log');

    yoke(Some, undefined);

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.getCall(0).args[0]).to.match(/^WARNING/i);
    console.log.restore();
  });

  it('should create yoke instance for restricted context', function() {

    var boundFunctions = [];

    function Some() {
      var yokeInstance = yoke(this);
      var boundOne_1 = yokeInstance.bind(this.one);
      var boundOne_2 = yokeInstance.bind(this.one);
      boundFunctions.push(boundOne_1);
      expect(boundOne_1).to.be.equal(boundOne_2);
    }
    Some.prototype.one = function () {};

    new Some();
    new Some();
    expect(boundFunctions[0]).to.be.not.equal(boundFunctions[1]);

    // TODO: fix it
    expect(function() {
      Some();
    }).to.not.throw(TypeError);

  });

});