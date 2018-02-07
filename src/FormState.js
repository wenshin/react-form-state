const vajs = require('vajs');

class FormState {
  /**
   *
   * @param {Object}          options
   * @param {Object}          options.data           初始数据
   * @param {vajs.Validator}  options.validator      具有校验功能的对象
   * @param {Function}        options.onStateChange  初始数据
   */
  constructor(options = {}) {
    if (options.validator && !options.validator.get && !options.validator.validate) {
      throw TypeError('new FormState({validator}) validator 必须是实现 vajs.ValidatorMap 接口的对象');
    }

    if (options.data && typeof options.data !== 'object') {
      throw TypeError('new FormState({data}) data 必须是 Object');
    }

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

  // 为了和 MapResult 保持一致的 API
  get value() {
    return this.data;
  }

  set value(data) {
    this.data = data;
  }

  init(keepResults) {
    this.results = {};
    this._invalidSet = new Set();

    if (!this.validator) return;

    const mapResult = this.validator.validate(this.data, {state: this});

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
   * @param  {string}                                options.name
   * 需要更新的字段名称
   * @param  {any}                                   options.value
   * 只更新数据和校验结果，不更新校验信息
   * @param  {boolean}                               options.notUpdateResult
   * 更新字段的自带校验结果
   * @param  {vajs.Result|vajs.MapReuslt}            options.result
   * 需要更新的字段值
   * @param  {vajs.Result|vajs.MapReuslt}
   */
  update({
    name,
    value,
    result,
    notUpdateResult
  }) {
    // not object and is the same value do not trigger validation
    if (!(value && typeof value === 'object') && value === this.data[name]) return null;

    let val = value;
    let res = result;
    if (isResult(value) || isMapResult(value)) {
      val = value.value;
      res = value;
    }

    this.data[name] = val;
    this.nameChanged = name;
    return this.validateOne({
      name,
      result: res,
      notUpdateResult
    });
  }

  /**
   * 重新校验值并更新校验结果，可用于只更新联合校验结果
   * this.validateOne({name}) 可以根据现有数据进行校验
   *
   * @param  {Object}                                options
   * 选项
   * @param  {string}                                options.name
   * 更新字段的自带校验信息
   * @param  {vajs.Result|vajs.MapReuslt}            options.result
   * 需要更新的字段值
   * @param  {vajs.Result|vajs.MapReuslt}
   */
  validateOne({name, result, notUpdateResult}) {
    const value = this.data[name];

    let newResult = new vajs.Result({value});
    if (this.validator && this.validator.get(name)) {
      const extra = {state: this, subResult: result};
      newResult = this.validator.validateOne(name, value, extra);
      if (newResult.promise) {
        newResult.promise = newResult
          .promise
          .then(res => this._updateResult(name, res, notUpdateResult))
          .catch(err => this._onUnhandledRejection(err, name, newResult.value));
      }
    }

    if (result) {
      newResult = mergeResult(result, newResult);
    }
    return this._updateResult(name, newResult, notUpdateResult);
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

  getResultsOf(name) {
    const result = this.results[name] || {};
    return result.results || {};
  }
}


FormState.vajs = vajs;
FormState.mergeResult = mergeResult;

module.exports = FormState;

function isResult(result) {
  if (result instanceof vajs.Result) {
    return true;
  }
  if (result && result.name && !result.results) {
    return true;
  }
  return false;
}

function isMapResult(result) {
  if (result instanceof vajs.MapResult) {
    return true;
  }
  if (result && result.results) {
    return true;
  }
  return false;
}

function mergeResult(result, otherResult) {
  const res = new vajs.Result({
    isValid: result.isValid && otherResult.isValid,
    message: result.message || otherResult.message,
    value: result.value,
    transformed: result.transformed
  });

  if (!result.results && otherResult.results) {
    res.results = otherResult.results;
  } else if (result.results && !otherResult.results) {
    res.results = result.results;
  } else if (result.results && otherResult.results) {
    res.results = result.results;
    const keys = Object.keys(otherResult.results);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!res.results[key]) {
        res.results[key] = otherResult.results[key];
      } else {
        res.results[key] = mergeResult(res.results[key], otherResult.results[key]);
      }
    }
  }
  return res;
}
