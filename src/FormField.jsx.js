import _omit from 'lodash/omit';
import React, {PropTypes, Children, cloneElement} from 'react';
import ExplainText from './ExplainText.jsx';
import FormChild from './FormChild.jsx';


export default class FormField extends FormChild {
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
    validResult: PropTypes.shape({
      isValid: PropTypes.bool,
      message: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    }),
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
    disabled: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.array
    ]),
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

  static ExplainClass = ExplainText;

  static setExplainClass(ExplainClass) {
    FormField.ExplainClass = ExplainClass;
  }

  pickProps(props) {
    return _omit(this.props, [
      'className',
      'label', 'labelTip', 'labelTipPlace',
      'explain', 'defaultExplain',
      'isExplainShow', 'isExplainInline',
      'show'
    ]);
  }

  renderLabel() {
    const {label, name, required} = this.props;
    return this._renderLabel(label, name, required);
  }

  _renderLabel(label, name, required) {
    return label ? (
      <label htmlFor={name} className='form-label'>
        {required ? <span className='form-field__required'>*</span> : null}
        {typeof label === 'string' ? <span dangerouslySetInnerHTML={{__html: label}} /> : label}
      </label>
    ) : null;
  }

  renderExplain() {
    const {
      name,
      explain,
      validResult,
      isExplainShow,
      isExplainInline,
      defaultExplain
    } = this.props;

    return isExplainShow ? (
      <FormField.ExplainClass
        name={name}
        inline={isExplainInline}
        validResult={validResult || this.formResult}
        explain={explain}
        defaultExplain={defaultExplain}
      />
    ) : null;
  }

  // 集成时可用于重写 获取 children 的方法
  renderField() {
    const {children, name, required} = this.props;
    let newChildren = children;
    // 默认如果只有一个子元素，自动会给子元素新增 value 属性
    // 注意 input，textarea 等内置元素，动态添加 props，React 15 加了一些警告提示
    if (Children.count(children) === 1 && typeof children === 'object') {
      const props = this.formValue === undefined ? {} : {value: this.formValue};
      props.onChange = children.props.onChange;
      props.required = children.props.required || required;
      if (name) props.name = name;

      if (Object.keys(props).length) {
        newChildren = cloneElement(children, props);
      }
    }
    return newChildren;
  }

  render() {
    const {className, show, disabled} = this.props;

    return (
      <div className={'form-field ' + className} style={{display: show ? '' : 'none'}}>
        {this.renderLabel()}
        {disabled ? (
          <div className='form-field-mask-container'>
            {this.renderField()}
            <div className='form-field-mask' />
          </div>
        ) : this.renderField()}
        {this.renderExplain()}
      </div>
    );
  }
}
