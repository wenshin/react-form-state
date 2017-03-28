import _omit from 'lodash/omit';
import React, {PropTypes, Children, cloneElement} from 'react';
// import HelpTips from './help-tip';
import Explain from './Explain.jsx';
import ExplainText from './ExplainText.jsx';
import FormChildComponent from './FormChildComponent.jsx';

const loop = () => {};

export default class FormField extends FormChildComponent {
  static propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    labelTip: PropTypes.string,
    labelTipPlace: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    // 是否使用解释框，默认使用，必须提供 name 属性
    isExplainShow: PropTypes.bool,
    // false，提示框非 inline 模式
    isExplainInline: PropTypes.bool,
    explain: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    }),
    defaultExplain: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        type: PropTypes.string,
        message: PropTypes.string
      })
    ]),
    required: PropTypes.bool,
    children: PropTypes.element,
    show: PropTypes.bool,
  };

  static defaultProps = {
    className: '',
    isExplainShow: true,
    isExplainInline: true,
    labelTipPlace: 'right',
    required: false,
    show: true
  };

  static omitProps(props) {
    return _omit(props, [
      'className',
      'label', 'labelTip', 'labelTipPlace',
      'explain', 'defaultExplain',
      'isExplainShow', 'isExplainInline',
      'show'
    ]);
  }

  renderLabel() {
    const {label, name, required} = this.props;
    return label ? (
      <label htmlFor={name} className='form-label'>
        {required ? <span className='form-field__required'>*</span> : null}
        {typeof label === 'string' ? <span dangerouslySetInnerHTML={{__html: label}} /> : label}
        {/* 这里使用隐藏，是为了保持左边对齐 */}
        {/*labelTip
          ? <HoverTip text={labelTip} position={labelTipPlace} theme={labelTheme} />
          : <span style={{width: '21px', height: '10px', display: 'inline-block'}} />
        */}
      </label>
    ) : null;
  }

  renderExplain() {
    const {
      name,
      isExplainShow,
      isExplainInline
    } = this.props;
    let {explain, defaultExplain} = this.props;

    if (isExplainShow && name) {
      explain = explain || this.formExplain;
    }
    if (typeof defaultExplain === 'string') {
      defaultExplain = Explain.info(defaultExplain);
    }
    return isExplainShow ? (
      <ExplainText
        explain={explain}
        inline={isExplainInline}
        defaultExplain={defaultExplain}
      />
    ) : null;
  }

  // 集成时可用于重写 获取 children 的方法
  renderField() {
    const {children, name} = this.props;
    let newChildren = children;
    // 默认如果只有一个子元素，自动会给子元素新增 value
    // 注意 input，textarea 等内置元素，动态添加 props，React 15 加了一些警告提示
    if (Children.count(children) === 1) {
      const props = this.formValue === undefined ? {} : {value: this.formValue};
      props.onChange = children.props.onChange || loop;

      if (name) props.name = name;
      if (Object.keys(props).length) {
        newChildren = cloneElement(children, props);
      }
    }
    return newChildren;
  }

  render() {
    const {className, show} = this.props;

    return (
      <div className={'form-field ' + className} style={{display: show ? '' : 'none'}}>
        {this.renderLabel()}

        {this.renderField()}

        {this.renderExplain()}
      </div>
    );
  }
}
