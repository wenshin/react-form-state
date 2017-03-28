import {PropTypes} from 'react';
import cx from 'classnames';
import FormChildComponent from './FormChildComponent.jsx';

/**
 * Explain 组件
 *
 * @usage
 *
 *    <Explain explain={{}} inline defaultExplain={{}} />
 *
 *    <Explain name='test' defaultExplain inline />
 */
export default class Explain extends FormChildComponent {
  static propTypes = {
    name: PropTypes.string,
    inline: PropTypes.bool,
    explain: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    }),
    // defaultExplain 是在 explain 不存在或者 explain.type === Explain.Types.SUCC 时使用
    defaultExplain: PropTypes.object,
    children: PropTypes.any
  };

  static defaultProps = {
    inline: false
  };

  static Types = {ERROR: 'error', WARN: 'warn', SUCC: 'success', INFO: 'info'};

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
    const ret = {message, type};
    if (!message) {
      ret.type = Explain.Types.SUCC;
      ret.message = '';
    } else if (!type) {
      ret.type = Explain.Types.ERROR;
    }
    return ret;
  };

  static success = (message) => {
    return Explain.explain(message);
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

  /**
   * 子类需要实现的方法
   * @param  {Object} explain 经过默认值处理的 explain 对象
   * @return {ReactElement}   用于 react 渲染的元素
   */
  renderSub() {
    throw new Error('Explain.renderSub should been implemented');
  }

  render() {
    let {explain, inline, name, defaultExplain} = this.props;

    if (name) {
      explain = explain || this.formExplain;
    }

    if (!explain || !Object.keys(explain).length) {
      explain = {...defaultExplain};
    } else if (explain.type === Explain.Types.SUCC && !explain.message && defaultExplain) {
      explain = {...defaultExplain};
      explain.type = Explain.Types.SUCC;
    }

    if (!explain) return null;

    const {type} = explain || {};

    let className = cx({
      'form-explain': true,
      'form-explain--inline': inline || this.inline
    });

    if (type) {
      className = `${className} form-explain--${type}`;
    }

    return (
      <div className={className}>
        {this.renderSub(explain)}
      </div>
    );
  }
}
