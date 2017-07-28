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

  it('FormState.updateState with value is FormState instance', (done) => {
    const subFormState = new FormState({
      data: {foo: 10, bar: 2},
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 12})
      })
    });

    const formState = new FormState({
      data: {foo: null},
      onStateChange(state) {
        assert.ok(!state.isValid);
        assert.ok(state.data.foo === subFormState);
        assert.ok(state.results.foo === subFormState);
        done();
      }
    });

    formState.updateState({name: 'foo', value: subFormState});
  });

  it('FormState.updateState with value is vajs.Result', (done) => {
    const v = vajs.number({max: 5});
    const mv = vajs.map({
      foo: vajs.number({max: 5}),
      bar: vajs.number({max: 12})
    });

    const subResultInvalid = v.validate(10);
    const subResultValid = v.validate(2);
    const subMapResultInvalid = mv.validate({foo: 10});
    const subMapResultValid = mv.validate({foo: 4, bar: 4});

    const states = [];
    const formState = new FormState({
      data: {foo: null},
      onStateChange(state) {
        states.push({
          isValid: state.isValid,
          data: {foo: state.data.foo},
          results: {foo: state.results.foo}
        });
        if (states.length === 4) {
          assert.ok(!states[0].isValid);
          assert.ok(states[0].data.foo === subResultInvalid);
          assert.ok(states[0].results.foo === subResultInvalid);

          assert.ok(states[1].isValid);
          assert.ok(states[1].data.foo === subResultValid);
          assert.ok(states[1].results.foo === subResultValid);

          assert.ok(!states[2].isValid);
          assert.ok(states[2].data.foo === subMapResultInvalid);
          assert.ok(states[2].results.foo === subMapResultInvalid);

          assert.ok(states[3].isValid);
          assert.ok(states[3].data.foo === subMapResultValid);
          assert.ok(states[3].results.foo === subMapResultValid);

          done();
        }
      }
    });

    formState.updateState({name: 'foo', value: subResultInvalid});
    formState.updateState({name: 'foo', value: subResultValid});
    formState.updateState({name: 'foo', value: subMapResultInvalid});
    formState.updateState({name: 'foo', value: subMapResultValid});
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

  it('update value with no result update', () => {
    const formState = new FormState({
      data: {foo: 1, bar: 2},
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 3})
      })
    });

    assert.ok(formState.isValid, 'init is valid');
    assert.ok(!Object.keys(formState.results).length, 'formState.results is not empty');

    formState.update({name: 'bar', value: 4, notUpdateResult: true});

    assert.ok(!formState.isValid, 'isValid');
    assert.ok(!formState.results.bar);

    formState.update({name: 'bar', value: 5});

    assert.ok(!formState.isValid, 'isValid');
    assert.ok(formState.results.bar);
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

  it('async validation when edit mode', (done) => {
    const formState = new FormState({
      isEdit: true,
      data: {
        foo: 3
      },
      onStateChange(state) {
        assert.ok(state.isValid);
        assert.ok(formState.results.foo.isValid);
        done();
      },
      validator: vajs.map({
        foo: vajs.async((v) => {
          return new Promise((resolve, reject) => {
            if (!v) return resolve(vajs.require().validate(v));
            setTimeout(() => {
              resolve(vajs.number({min: 2}));
            }, 5);
          });
        })
      })
    });

    assert.ok(!formState.isValid);
    assert.ok(!formState.results.foo.isValid);
  });

  it('should async update validator', () => {
    const formState = new FormState({
      data: {
        foo: 3,
        bar: 2
      },
      validator: vajs.map({
        foo: vajs.number({max: 5}),
        bar: vajs.number({max: 3}),
      })
    });

    assert.ok(formState.isValid);
    formState.updateValidator(vajs.map({
      foo: vajs.number({max: 1}),
      bar: vajs.number({max: 1}),
    }));
    assert.ok(!formState.isValid);
    assert.equal(Object.keys(formState.results).length, 2)
  });
});
