const vajs = require('vajs');
const assert = require('assert');
const FormState = require(`../${process.env.NODE_LIB || 'src'}/FormState`);


describe('FormState', () => {
  it('constructor', () => {
    let formState = new FormState({
      data: {foo: 1},
      validator: vajs.map({
        foo: vajs.number({max: 0})
      })
    });
    assert.ok(!formState.isValid);
    assert.ok(!formState.results.foo);

    formState = new FormState();
    assert.ok(formState.isValid);
    assert.ok(formState.isEmpty);

    assert.throws(() => {
      new FormState({
        validator: vajs.require()
      });
    }, Error);
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
          state.update({name: 'bar', value: state.data.foo + 10});
        }
      }
    });

    assert.ok(!formState.results.bar, 'bar');
    formState.updateState({name: 'foo', value: 4});
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.results.foo.isValid, 'foo');
    assert.ok(!formState.results.bar.isValid, 'bar');
    assert.ok(formState.results.bar instanceof vajs.Result);
  });

  it('FormState.updateState update same value', () => {
    const formState = new FormState({
      data: {foo: 1, bar: 2},
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 12})
      }),
      onStateChange(state) {
        throw new Error('except not to trigger state change event');
      }
    });

    formState.updateState({name: 'foo', value: 1});
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
          // only validate
          state.validateOne({name: 'bar'});
        }
      }
    });

    assert.ok(!formState.isValid, 'init isValid');
    formState.updateState({name: 'foo', value: 4});
    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.results.foo.isValid, 'foo');
    assert.ok(!formState.results.bar.isValid, 'bar');
    assert.ok(formState.results.bar instanceof vajs.Result);
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
          formState.updateState({name: 'foo', value: 2});
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
          // updateState 校验
          if (err.value) {
            assert.equal(err.value, 2);
            done();
          }
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

    formState.updateState({name: 'foo', value: 2});
  });
});
