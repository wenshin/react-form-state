import vajs from 'vajs';

const Util = {
  mergeNestedResult,
  getNestedResult
};

export default Util;


function mergeNestedResult(parentResult, nestedResult) {
  if (!parentResult && !nestedResult) {
    throw new Error('parentResult and nestedResult needed');
  }
  const parent = parentResult || new vajs.Result();
  const nested = nestedResult || new vajs.Result();

  const merged = new vajs.Result();
  merged.isValid = parent.isValid && nested.isValid;
  merged.value = parent.value || nested.value;
  merged.transformed = parent.transformed || nested.transformed;
  merged.initial = parent;
  nestedResult && (merged.nested = nested);

  if (!parent.isValid) {
    merged.message = parent.message;
    if (!merged.message && !nested.isValid) {
      merged.message = nested.message;
    }
  } else if (!nested.isValid) {
    merged.message = nested.message;
  }
  return merged;
}


function getNestedResult(result) {
  return (result && result.nested) || {};
}
