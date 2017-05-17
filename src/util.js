import vajs from 'vajs';

const Util = {
  mergeNestedResult,
  getNestedResult
};

export default Util;


function mergeNestedResult(parentResult, nestedResult) {
  let merged = new vajs.Result();
  merged.isValid = parentResult.isValid && nestedResult.isValid;
  merged.initial = parentResult;
  merged.nested = nestedResult;

  if (!parentResult.isValid) {
    merged.message = parentResult.message;
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
