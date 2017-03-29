const vajs = require('vajs');

class FormState {
  constructor(options = {}) {
    this.data = options.data || {};
    this.validator = options.validator;
    this.onStateChange = options.onStateChange;
    // 如果不是 edit 模式，那么首次数据校验错误信息不会存到 this.result 中
    // 这样新建默认不会显示很多必填的错误显示
    this.isEdit = options.isEdit;
    this.nestFailMessage = options.nestFailMessage || 'validation fail';
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
    for (const key of Object.keys(result.message)) {
      if (this.isEdit) {
        // 不记录校验成功的参数
        this.result[key] = new vajs.Result({
          value: result.value[key],
          isValid: !result.message[key],
          message: result.message[key],
          transformed: result.transformed[key]
        });
      } else {
        // 不记录任何校验信息，只是的 isValid 生效
        this._invalidSet.add(key);
      }
    }
  }

  // 可用于联合校验
  // this.validateOne(name) 可以根据现有数据进行校验
  validateOne(name, value, validationResult) {
    if (value === undefined) {
      value = this.data[name];
    }

    // 联合校验时，需要和嵌套结果同时进行判断
    if (validationResult === undefined && this.result[name]) {
      validationResult = this.result[name].nest;
    }

    let result = new vajs.Result({
      value,
      isValid: true
    });

    if (this.validator.get(name)) {
      result = this.validator.validateOne(name, value, this);
    }

    if (validationResult) {
      const isValid = result.isValid && validationResult.isValid;
      if (isSingleResult(validationResult)) {
        // 如果当前校验位成功，子校验为失败，使用子校验的错误信息
        if (result.isValid && !validationResult.isValid) {
          result.message = validationResult.message;
        }
      } else {
        result.message = isValid ? '' : this.nestFailMessage;
      }
      result.nest = validationResult;
      result.isValid = isValid;
    }

    result.isValid
      ? this._invalidSet.delete(name)
      : this._invalidSet.add(name);

    // 数据更新后，记录校验成功的数据
    // 这样交互体验更好
    this.result[name] = result;
    return result;
  }

  /**
   * [update description]
   * @param  {String}      name
   * @param  {any}         value
   * @param  {vajs.Result} validationResult 自带校验结果
   */
  updateState(name, value, validationResult) {
    this.update(name, value, validationResult);
    this.onStateChange && this.onStateChange(this);
  }

  // 可用于进行关联数据更新
  update(name, value, validationResult) {
    if (value === this.data[name]) return;
    this.data[name] = value;
    this.nameChanged = name;
    this.validateOne(name, value, validationResult);
  }
}


module.exports = FormState;


function isSingleResult(result) {
  return result instanceof vajs.Result && typeof result.message === 'string'
}
