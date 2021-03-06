import React from 'react';
import PropTypes from 'prop-types';
import FormChild from './FormChild.jsx';
import Explain from './Explain';

const COLORS = {
  info: '#999',
  success: '#4CAF50',
  error: '#F44336',
  warn: '#FF9800',
};

/**
 * ExplainBase 组件
 *
 * @usage
 *
 *    <ExplainBase explain={{}} inline defaultExplain={{}} />
 *
 *    <ExplainBase name='test' defaultExplain inline />
 */
export default class ExplainText extends FormChild {
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
    defaultExplain: PropTypes.oneOfType([
      PropTypes.shape({
        type: PropTypes.string,
        message: PropTypes.string
      }),
      PropTypes.string
    ]),
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
  /* eslint-disable class-methods-use-this */
  renderExplain(explain) {
    return explain.message || null;
  }
  /* eslint-enable class-methods-use-this */

  render() {
    const {inline, name} = this.props;
    let {
      className,
      validResult,
      explain,
      defaultExplain
    } = this.props;

    if (name) {
      validResult = validResult || this.formResult;
    }

    if (typeof defaultExplain === 'string') {
      defaultExplain = Explain.info(defaultExplain);
    }

    explain = explain || formatValidResult(validResult, defaultExplain);

    const {type} = explain;

    const style = {};
    if (type) {
      style.color = COLORS[type];
    }

    if (inline || this.inline) {
      style.display = 'inline-block';
      style.marginLeft = '10px';
    }

    return (
      <div className={`form-explain ${className || ''}`} style={style}>
        {this.renderExplain(explain)}
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
  } else if (validResult.pending) {
    explain = Explain.pending(getMessage(validResult.message, '校验中...'));
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
