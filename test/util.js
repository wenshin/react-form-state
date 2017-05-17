const vajs = require('vajs');
const assert = require('assert');
const Util = require(`../${process.env.NODE_LIB || 'src'}/util`).default;


describe('Util', () => {
  it('mergeNestedResult', () => {
    let result = vajs.Result({isValid: true});
    let nestedResult = vajs.Result({isValid: false, message: 'nested error'});
    let merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, 'nested error');
    assert.equal(Util.getNestedResult(merged), nestedResult)

    result = vajs.Result({isValid: false, message: 'result error'});
    nestedResult = vajs.Result({isValid: true});
    merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, 'result error');
    assert.equal(Util.getNestedResult(merged), nestedResult)

    result = vajs.Result({isValid: false, message: 'result error'});
    nestedResult = vajs.Result({isValid: false, message: 'nested error'});
    merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(!merged.isValid);
    assert.equal(merged.message, 'result error');
    assert.equal(Util.getNestedResult(merged), nestedResult)

    result = vajs.Result({isValid: true});
    nestedResult = vajs.Result({isValid: true});
    merged = Util.mergeNestedResult(result, nestedResult);

    assert.ok(merged.isValid);
    assert.ok(!merged.message);
    assert.equal(Util.getNestedResult(merged), nestedResult)
  });
});
