import vajs from 'vajs';

const Util = {
  mergeNestedResult,
  getNestedResult
};

export default Util;


function mergeNestedResult(result, nestedResult) {
  let merged = new vajs.Result();
  merged.isValid = result.isValid && nestedResult.isValid;
  merged.initial = result;
  merged.nested = nestedResult;

  if (!result.isValid) {
    merged.message = result.message;
    if (!merged.message && !nestedResult.isValid) {
      merged.message = nestedResult.message;
    }
  } else if (!nestedResult.isValid) {
    merged.message = nestedResult.message;
  }
  return merged;
}


function getNestedResult(result) {
  return (result && result.nested) || {};
}
