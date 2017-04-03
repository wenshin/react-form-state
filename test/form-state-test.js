const vajs = require('vajs');
const assert = require('assert');
const FormState = require(`../${process.env.NODE_LIB || 'src'}/FormState`);


describe('FormState', () => {
  it('constructor', () => {
    const formState = new FormState({
      data: {foo: 1},
      validator: vajs.map({
        foo: vajs.number({max: 0})
      })
    });
    assert.ok(!formState.isValid);
    assert.ok(!formState.results.foo);
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

    assert.ok(!formState.results.bar, 'bar');
    formState.updateState('foo', 4);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.results.foo.isValid, 'foo');
    assert.ok(!formState.results.bar.isValid, 'bar');
    assert.ok(formState.results.bar instanceof vajs.Result);
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
    assert.ok(formState.results.foo.isValid, 'foo');
    assert.ok(!formState.results.bar.isValid, 'bar');
    assert.ok(formState.results.bar instanceof vajs.Result);
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
    assert.ok(!formState.results.foo.isValid, 'foo');
    assert.ok(formState.results.foo.message, formState.nestFailMessage);
    assert.ok(formState.results.foo.nest === fooState, 'foo');
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
    assert.ok(!formState.results.foo.isValid, 'foo');
    assert.ok(formState.results.foo.message, formState.nestFailMessage);
    assert.ok(formState.results.foo.nest === result, 'foo nest');
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
    assert.ok(!formState.results.foo.isValid, 'foo');
    assert.ok(formState.results.foo.message, result.message);
    assert.ok(formState.results.foo.nest, 'have foo nest');

    result = vajs.number({max: 10}).validate(9);
    formState.updateState('foo', 9, result);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.results.foo.isValid, 'foo');
    assert.ok(formState.results.foo.message, formState.validator.validateOne('foo', 9));
    assert.ok(formState.results.foo.nest, 'have foo nest');
  });

  it('async validation', () => {
    const formState = new FormState({
      data: {},
      validator: vajs.map({
        foo: vajs.number({max: 5})
      })
    });

    let result = vajs.number({max: 1}).validate(2);
    formState.updateState('foo', 2, result);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.results.foo.isValid, 'foo');
    assert.ok(formState.results.foo.message, result.message);
    assert.ok(formState.results.foo.nest, 'have foo nest');

    result = vajs.number({max: 10}).validate(9);
    formState.updateState('foo', 9, result);
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.results.foo.isValid, 'foo');
    assert.ok(formState.results.foo.message, formState.validator.validateOne('foo', 9));
    assert.ok(formState.results.foo.nest, 'have foo nest');
  });

  it('async validation', (done) => {
    let count = 0;
    const formState = new FormState({
      data: {foo: 6},
      onStateChange(state) {
        count++;
        if (count === 1) {
          assert.equal(state.data.foo, 6);
          assert.ok(!state.isValid);
          formState.updateState('foo', 2);
        } else if (count === 2) {
          assert.equal(state.data.foo, 2);
          assert.ok(!state.isValid);
          assert.ok(state.results.foo.pending);
        }
        assert.equal(state.data.foo, 2);
        assert.ok(state.isValid);
        if (count === 3) done();
      },
      validator: vajs.map({
        foo: vajs.async((val) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(vajs.number({max: 5}).validate(val));
            }, 5);
          });
        })
      })
    });
  });

  it('async validation handle error', (done) => {
    const formState = new FormState({
      data: {},
      onUnhandledRejection(err) {
        try {
          assert.equal(err.name, 'foo');
          assert.equal(err.value, 2);
          done();
        } catch (error) {
          done(error);
        }
      },
      validator: vajs.map({
        foo: vajs.async(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('test'));
            }, 5);
          });
        })
      })
    });

    formState.updateState('foo', 2);
  });
});
