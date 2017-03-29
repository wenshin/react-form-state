const vajs = require('vajs');
const assert = require('assert');
const FormState = require('../src/FormState');


describe('FormState', () => {
  it('constructor', () => {
    const formState = new FormState({
      data: {foo: 1},
      validator: vajs.map({
        foo: vajs.number({max: 0})
      })
    });
    assert.ok(!formState.isValid);
    assert.ok(!formState.result.foo);
  });

  it('options.onStateChange and joint update validation', () => {
    const formState = new FormState({
      data: {foo: 1, bar: 2},
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 12})
      }),
      onStateChange(state) {
        if (state.nameChanged === 'foo') {
          state.update('bar', state.data.foo + 10);
        }
      }
    });

    assert.ok(!formState.result.bar, 'bar');
    formState.updateState('foo', 4);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.result.foo.isValid, 'foo');
    assert.ok(!formState.result.bar.isValid, 'bar');
    assert.ok(formState.result.bar instanceof vajs.Result);
  });

  it('joint no update validation', () => {
    const formState = new FormState({
      data: {foo: 1, bar: 2},
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 1})
      }),
      onStateChange(state) {
        if (state.nameChanged === 'foo') {
          state.validateOne('bar');
        }
      }
    });

    assert.ok(!formState.isValid, 'init isValid');
    formState.updateState('foo', 4);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.result.foo.isValid, 'foo');
    assert.ok(!formState.result.bar.isValid, 'bar');
    assert.ok(formState.result.bar instanceof vajs.Result);
  });

  it('nest state validation', () => {
    const formState = new FormState({
      data: {},
      validator: vajs.map({
        foo: vajs.v((value) => {
          return value < 5;
        })
      })
    });

    const fooState = new FormState({
      data: {},
      validator: vajs.map({
        a: vajs.number({max: 10})
      })
    });

    fooState.updateState('a', 7);
    formState.updateState('foo', fooState.data, fooState);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.result.foo.isValid, 'foo');
    assert.ok(formState.result.foo.message, formState.nestFailMessage);
    assert.ok(formState.result.foo.nest === fooState, 'foo');
  });

  it('nest vajs.map result validation', () => {
    const formState = new FormState({
      data: {},
      validator: vajs.map({
        foo: vajs.v((value) => {
          return value < 5;
        })
      })
    });

    const result = vajs.map({
      a: vajs.number({max: 1})
    }).validate({a: 2});
    formState.updateState('foo', {a: 2}, result);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.result.foo.isValid, 'foo');
    assert.ok(formState.result.foo.message, formState.nestFailMessage);
    assert.ok(formState.result.foo.nest === result, 'foo nest');
  });

  it('nest vajs normal result validation', () => {
    const formState = new FormState({
      data: {},
      validator: vajs.map({
        foo: vajs.number({max: 5})
      })
    });

    let result = vajs.number({max: 1}).validate(2);
    formState.updateState('foo', 2, result);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.result.foo.isValid, 'foo');
    assert.ok(formState.result.foo.message, result.message);
    assert.ok(formState.result.foo.nest, 'have foo nest');

    result = vajs.number({max: 10}).validate(9);
    formState.updateState('foo', 9, result);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.result.foo.isValid, 'foo');
    assert.ok(formState.result.foo.message, formState.validator.validateOne('foo', 9));
    assert.ok(formState.result.foo.nest, 'have foo nest');
  });
});
