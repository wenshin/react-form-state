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
    assert.ok(!formState.result.foo.isValid);
    assert.ok(formState.result.foo.message);
    assert.ok(formState.result.foo instanceof vajs.Result);
  });

  it('options.onFieldChange and joint validation', () => {
    const formState = new FormState({
      data: {foo: 1, bar: 2},
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 12})
      }),
      onFieldChange(name, value, state) {
        if (name === 'foo') {
          state.update('bar', value + 10);
        }
      }
    });

    assert.ok(!formState.result.bar, 'bar');
    formState.update('foo', 4);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.result.foo.isValid, 'foo');
    assert.ok(!formState.result.bar.isValid, 'bar');
  });

  it('options.formateReason', () => {
    const formState = new FormState({
      data: {foo: 1},
      validator: vajs.map({
        foo: vajs.number({max: 2})
      }),
      formatResult(result) {
        if (result) {
          if (result.isValid) {
            return {type: 'success', message: 'ok'};
          }
          return {type: 'error', message: 'fail'};
        }
        return null;
      }
    });

    assert.ok(!formState.getResult('foo'));
    formState.update('foo', 3);
    assert.deepEqual(formState.getResult('foo'), {type: 'error', message: 'fail'});
    formState.update('foo', 1);
    assert.deepEqual(formState.getResult('foo'), {type: 'success', message: 'ok'});
  });
});
