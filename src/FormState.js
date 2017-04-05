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
    this.nestFailMessage = options.nestFailMessage || 'validation fail';
    this.nameChanged = '';

    this.init();
  }

  get isValid() {
    return !this._invalidSet.size;
  }

  getNestResult(name) {
    const result = this.results[name];
    const nest = (result && result.nest) || {};
    if (nest instanceof FormState) {
      return (nest && nest.results) || {};
    }
    return nest;
  }

  init() {
    this.results = {};
    this._invalidSet = new Set();

    if (!this.validator) return;

    const mapResult = this.validator.validate(this.data, this);
    for (const name of Object.keys(mapResult.results)) {
      const result = mapResult.results[name];
      if (!result.isValid) {
        if (this.isEdit) {
          // 不记录校验成功的参数
          this.results[name] = result;
        }
        if (result.promise) {
          this._dealInitResultPromise(name, result);
        }
        // 不记录任何校验信息，只是的 isValid 生效
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
        } else if (res.isValid) {
          this._invalidSet.delete(name);
        } else {
          this._invalidSet.add(name);
        }
        this._triggerStateChange();
      })
      .catch(err => this._onUnhandledRejection(err, name, result.value));
  }

  /**
   * [update description]
   * @param  {String}      name
   * @param  {any}         value
   * @param  {vajs.Result} validationResult 自带校验结果
   */
  updateState(name, value, validationResult) {
    const result = this.update(name, value, validationResult);
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

  // 可用于进行关联数据更新
  update(name, value, validationResult) {
    if (!(value && typeof value === 'object') && value === this.data[name]) return null;
    this.data[name] = value;
    this.nameChanged = name;
    return this.validateOne(name, value, validationResult);
  }

   // 可用于联合校验
  // this.validateOne(name) 可以根据现有数据进行校验
  validateOne(name, value, validationResult) {
    if (value === undefined) {
      value = this.data[name];
    }

    // 联合校验时，需要和嵌套结果同时进行判断
    if (validationResult === undefined && this.results[name]) {
      validationResult = this.results[name].nest;
    }

    let result = new vajs.Result({value});

    if (this.validator && this.validator.get(name)) {
      result = this.validator.validateOne(name, value, this);
      if (result.promise) {
        result.promise = result
          .promise
          .then(res => this._mergeResult(name, res, validationResult))
          .catch(err => this._onUnhandledRejection(err, name, result.value));
      }
    }
    return this._mergeResult(name, result, validationResult);
  }

  _mergeResult(name, result, validationResult) {
    if (validationResult) {
      result.nest = validationResult;
      if (!validationResult.isValid) {
        const isValid = result.isValid && validationResult.isValid;
        if (isSingleResult(validationResult)) {
          // 如果当前校验为成功，子校验为失败，使用子校验的错误信息
          if (result.isValid && !validationResult.isValid) {
            result.message = validationResult.message;
          }
        } else if (result.isValid) {
          // 如果当前校验失败，则使用当前校验的 message，如果当前校验成功则使用默认的嵌套失败信息
          result.message = isValid ? '' : this.nestFailMessage;
        }
        result.isValid = isValid;
      }
    }

    result.isValid
      ? this._invalidSet.delete(name)
      : this._invalidSet.add(name);

    // 数据更新后，记录校验成功的数据
    // 这样交互体验更好
    this.results[name] = result;
    return result;
  }

  _onUnhandledRejection(err, name, value) {
    err.name = name;
    err.value = value;
    this.onUnhandledRejection && this.onUnhandledRejection(err);
  }
}


FormState.va = vajs;

module.exports = FormState;


function isSingleResult(result) {
  return result instanceof vajs.Result && typeof result.message === 'string';
}
