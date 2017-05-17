const vajs = require('vajs');
const assert = require('assert');
const Util = require(`../${process.env.NODE_LIB || 'src'}/util`).default;


describe('Util', () => {
  it('mergeNestedResult combination', () => {
    let result = vajs.Result({isValid: true});
    let nestedResult = vajs.Result({isValid: false, message: 'nested error'});
    let merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, nestedResult.message);
    assert.equal(Util.getNestedResult(merged), nestedResult);

    result = vajs.Result({isValid: false, message: result.message});
    nestedResult = vajs.Result({isValid: true});
    merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, result.message);
    assert.equal(Util.getNestedResult(merged), nestedResult);

    result = vajs.Result({isValid: false, message: 'result error'});
    nestedResult = vajs.Result({isValid: false, message: 'nested error'});
    merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, result.message);
    assert.equal(Util.getNestedResult(merged), nestedResult);

    result = vajs.Result({isValid: true});
    nestedResult = vajs.Result({isValid: true});
    merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(merged.isValid);
    assert.ok(!merged.message);
    assert.equal(Util.getNestedResult(merged), nestedResult);
  });

  it('mergeNestedResult with one argument', () => {
    let nestedResult = vajs.Result({isValid: false, message: 'nested error', value: 2});
    let merged = Util.mergeNestedResult(null, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, nestedResult.message);
    assert.equal(merged.value, nestedResult.value);
    assert.equal(Util.getNestedResult(merged), nestedResult);

    let parentResult = vajs.Result({isValid: false, message: 'nested error', value: 2});
    merged = Util.mergeNestedResult(parentResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, nestedResult.message);
    assert.equal(merged.value, nestedResult.value);
    assert.deepEqual(Util.getNestedResult(merged), {});
  });
});
