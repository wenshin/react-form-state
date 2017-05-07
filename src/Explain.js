export default class Explain {
  static Types = {
    ERROR: 'error',
    WARN: 'warn',
    SUCC: 'success',
    INFO: 'info',
    PENDING: 'pending'
  };

  /**
   * Explain 对象工厂函数
   * @param  {String} message 展示给用户的信息
   * @param  {String} type    类型，包括 Explain.Types 的相关类型
   * @return {Explain}
   *
   * @usage
   * ```
   * Explain.expalin() => {type: 'success', message: ''}
   * Explain.expalin(0) => {type: 'success', message: ''}
   * Explain.expalin('') => {type: 'success', message: ''}
   * Explain.expalin(null) => {type: 'success', message: ''}
   * Explain.expalin('abc') => {type: 'err', message: 'abc'}
   * Explain.expalin('abc', Explain.Types.INFO) => {type: 'tip', message: 'abc'}
   * ```
   */
  static explain = (message, type) => {
    const ret = new Explain(type, message);
    if (!message) {
      ret.type = Explain.Types.SUCC;
      ret.message = '';
    } else if (!type) {
      ret.type = Explain.Types.ERROR;
    }
    return ret;
  };

  static success = (message) => {
    return Explain.explain(message, Explain.Types.SUCC);
  };

  static fail = (message) => {
    return Explain.explain(message, Explain.Types.ERROR);
  };

  static warn = (message) => {
    return Explain.explain(message, Explain.Types.WARN);
  };

  static info = (message) => {
    return Explain.explain(message, Explain.Types.INFO);
  };

  static pending = (message) => {
    return Explain.explain(message, Explain.Types.PENDING);
  };

  constructor(type, message) {
    this.type = type;
    this.message = message;
  }
}
