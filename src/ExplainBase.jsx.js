import {PropTypes} from 'react';
import cx from 'classnames';
import FormChildComponent from './FormChildComponent.jsx';
import Explain from './Explain';

/**
 * ExplainBase 组件
 *
 * @usage
 *
 *    <ExplainBase explain={{}} inline defaultExplain={{}} />
 *
 *    <ExplainBase name='test' defaultExplain inline />
 */
export default class ExplainBase extends FormChildComponent {
  static propTypes = {
    name: PropTypes.string,
    inline: PropTypes.bool,
    explain: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    }),
    validResult: PropTypes.shape({
      isValid: PropTypes.bool,
      message: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    }),
    // defaultExplain 是在 validResult 不存在或者 validResult.isValid === true 时使用
    defaultExplain: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    }),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ])
  };

  static defaultProps = {
    inline: false,
    children: null,
    defaultExplain: {}
  };

  /**
   * 子类需要实现的方法
   * @param  {Object} explain 经过默认值处理的 explain 对象
   * @return {ReactElement}   用于 react 渲染的元素
   */
  renderSub() {
    throw new Error('ExplainBase.renderSub should been implemented');
  }

  render() {
    const {inline, name, defaultExplain} = this.props;
    let {validResult, explain} = this.props;

    if (name) {
      validResult = validResult || this.formResult;
    }

    explain = explain || formatValidResult(validResult, defaultExplain);

    const {type} = explain;

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


function formatValidResult(validResult, defaultExplain) {
  let explain;
  if (!validResult) {
    explain = {...defaultExplain};
  } else if (validResult.isValid) {
    explain = Explain.success(getMessage(validResult.message, defaultExplain.message || 'OK'));
  } else {
    explain = Explain.fail(getMessage(validResult.message, defaultExplain.message || '校验失败！'));
  }
  return explain;
}


function getMessage(message, defaultMessage) {
  // vajs.map validate 后的结果的 message 是对象，这时候使用默认信息
  if (message && typeof message === 'object') {
    return defaultMessage;
  }
  return message || defaultMessage;
}
