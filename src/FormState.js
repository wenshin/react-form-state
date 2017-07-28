const vajs = require('vajs');

class FormState {
  constructor(options = {}) {
    this.data = options.data || {};
    this.validator = options.validator;
    this.onStateChange = options.onStateChange;
    this.onUnhandledRejection = options.onUnhandledRejection;
    // 如果不是 edit 模式，那么首次数据校验错误信息不会存到 this.results 中
    // 这样新建默认不会显示很多必填的错误显示
    this.isEdit = options.isEdit;
    this.nameChanged = '';

    this.init(this.isEdit);
  }

  get isValid() {
    return !this._invalidSet.size;
  }

  get isEmpty() {
    return !Object.keys(this.data).length;
  }

  init(keepResults) {
    this.results = {};
    this._invalidSet = new Set();

    if (!this.validator) return;

    const mapResult = this.validator.validate(this.data, this);

    if (!mapResult.results) {
      throw new Error('FormState.constructor(options) the result of options.validator.validate() must have results property');
    }

    for (const name of Object.keys(mapResult.results)) {
      const result = mapResult.results[name];
      // 不记录校验成功的参数
      if (!result.isValid) {
        // 编辑模式保存所有校验信息
        // 非编辑模式，不保存校验信息，只让 isValid 生效
        if (keepResults) {
          this.results[name] = result;
        }
        if (result.promise) {
          this._dealInitResultPromise(name, result);
        }
        this._invalidSet.add(name);
      }
    }
  }

  _dealInitResultPromise(name, result) {
    result
      .promise
      .then((res) => {
        if (this.isEdit) {
          this.results[name] = res;
        }

        if (res.isValid) {
          this._invalidSet.delete(name);
        } else {
          this._invalidSet.add(name);
        }
        this._triggerStateChange();
      })
      .catch(err => this._onUnhandledRejection(err, name, result.value));
  }

  /**
   * 动态更新 validator，可用于动态切换校验方式
   */
  updateValidator(validator) {
    this.validator = validator;
    this.init(true);
  }

  /**
   * 更新、校验数据并触发 state 更新事件
   * @param  {Object}  options   同 update 方法参数
   */
  updateState(options) {
    const result = this.update(options);
    // 值没有变化不触发变更
    if (!result) return;

    if (result.promise) {
      result
        .promise
        .then(() => this._triggerStateChange());
    }
    this._triggerStateChange();
  }

  _triggerStateChange() {
    this.onStateChange && this.onStateChange(this);
  }

  /**
   * 更新和校验数据
   * @param  {Object}                                options
   * 选项
   * @param  {String}                                options.name
   * 需要更新的字段名称
   * @param  {any}                                   options.value
   * 需要更新的字段值
   * @param  {vajs.Result|vajs.MapReuslt}
   */
  update({name, value, notUpdateResult}) {
    if (!(value && typeof value === 'object') && value === this.data[name]) return null;
    this.data[name] = value;
    this.nameChanged = name;
    return this.validateOne({name, value, notUpdateResult});
  }

  // 可用于联合校验
  // this.validateOne(name) 可以根据现有数据进行校验
  validateOne(options) {
    const {name, notUpdateResult} = options;
    let {value} = options;
    // 如果没有提供 value 属性，则认为校验当前保存的值
    if (!('value' in options)) {
      value = this.data[name];
    }

    let result = new vajs.Result({value});
    if (this.validator && this.validator.get(name)) {
      result = this.validator.validateOne(name, value, this);
      if (result.promise) {
        result.promise = result
          .promise
          .then(res => this._updateResult(name, res, notUpdateResult))
          .catch(err => this._onUnhandledRejection(err, name, result.value));
      }
    } else if (value instanceof FormState || isResult(value)) {
      result = value;
    }
    return this._updateResult(name, result, notUpdateResult);
  }

  _updateResult(name, result, notUpdateResult) {
    result.isValid
      ? this._invalidSet.delete(name)
      : this._invalidSet.add(name);

    if (!notUpdateResult) {
      // 数据更新后，记录校验成功的数据
      // 这样交互体验更好
      this.results[name] = result;
    }
    return result;
  }

  _onUnhandledRejection(err, name, value) {
    err.name = name;
    err.value = value;
    this.onUnhandledRejection && this.onUnhandledRejection(err);
  }
}


FormState.vajs = vajs;

module.exports = FormState;

function isResult(result) {
  let isResult = result
    && typeof result === 'object'
    && 'value' in result;

  if (!result.isValid) {
    isResult = isResult
      && ('message' in result || 'results' in result);
  }
  return isResult;
}
