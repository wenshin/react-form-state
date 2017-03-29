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
    // defaultExplain 是在 explain 不存在或者 explain.type === Explain.Types.SUCC 时使用
    defaultExplain: PropTypes.object,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ])
  };

  static defaultProps = {
    inline: false,
    children: null
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
