const vajs = require('vajs');

class FormState {
  constructor(options = {}) {
    this.data = options.data || {};
    this.validator = options.validator;
    this.onFieldChange = options.onFieldChange;
    this.formatResult = options.formatResult;
    this.nameChanged = '';

    this.init();
  }

  get isValid() {
    return !this._invalidSet.size;
  }

  init() {
    this.result = {};
    if (!this.validator) {
      this._invalidSet = new Set();
      return;
    }

    const result = this.validator.validate(this.data, this);
    this._invalidSet = new Set(Object.keys(result.message));
    // 初始化时，并不记录校验成功的参数
    for (const key of Object.keys(result.message)) {
      this.result[key] = new vajs.Result({
        value: result.value[key],
        isValid: !result.message[key],
        message: result.message[key],
        transformed: result.transformed[key]
      });
    }
  }

  validateOne(name, value) {
    const result = this.validator.validateOne(name, value, this);
    return result;
  }

  /**
   * [update description]
   * @param  {String}      name
   * @param  {any}         value
   * @param  {vajs.Result} validationResult 自带校验结果
   */
  update(name, value, validationResult) {
    if (value === this.data[name]) return;
    this.data[name] = value;
    this.nameChanged = name;

    this.onFieldChange && this.onFieldChange(name, value, this);

    let result = new vajs.Result({
      value,
      isValid: true
    });

    if (this.validator.get(name)) {
      result = this.validateOne(name, value);
    }

    if (validationResult) {
      if (isMixResult(validationResult)) {
        result.isValid = result.isValid && validationResult.isValid;
        result.nest = validationResult;
        result.message = 'validation fail';
      } else {
        result = validationResult;
      }
    }

    result.isValid
      ? this._invalidSet.delete(name)
      : this._invalidSet.add(name);

    // 数据更新后，记录校验成功的数据
    // 这样交互体验更好
    this.result[name] = result;
  }

  getResult(name) {
    const result = this.result[name];
    if (this.formatResult && typeof this.formatResult === 'function') {
      return this.formatResult(result, name, this.data);
    }
    return result;
  }
}


module.exports = FormState;


function isMixResult(result) {
  return result.message && typeof result.message === 'object';
}
