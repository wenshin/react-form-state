import _omit from 'lodash/omit';
import {PropTypes} from 'react';
import FormState from './FormState';

import Form from './Form.jsx';
import FormChild from './FormChild.jsx';

const {vajs} = FormState;

export default class FormControl extends FormChild {
  static propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    validator: PropTypes.object,
    // 设置 defaultValue 表示把组件声明成 uncontrolled 组件
    // 注意，defaultValue 和 value 只使用其中一个
    defaultValue: PropTypes.any,
    // 设置 value 表示把组件声明成 controlled 组件
    value: PropTypes.any
  };

  /**
   * 扩展 FormControl 的静态对象属性，比如 propTypes, defaultProps
   * @param  {String} propertyName 要扩展的属性名
   * @param  {Object} update       更新的值
   * @return {Object}              新的属性值
   */
  static extendsStatic(propertyName, update) {
    return Object.assign({}, FormControl[propertyName] || {}, update);
  }

  constructor(props) {
    super(props);
    this._collectState = null;
    this._isCollectData = false;
    // 缓存首次校验的 value 值
    this._value = null;
    this._validator = null;
    this._initialized = false;
  }

  get value() {
    return this.props.value || this.formValue || this._value;
  }

  get validator() {
    if (this._isCollectData
      && this._validator
      && this._validator.size
      && this.props.validator
      && this.props.validator.size
    ) {
      this._validator.merge(this.props.validator);
      return this._validator;
    }
    return this.props.validator || this._validator;
  }

  // 给子类继承时使用的工具函数
  pickProps() {
    const {defaultValue} = this.props;
    // React 要求 value 和 defaultValue 只能有一个。。。
    if (defaultValue !== undefined) {
      return _omit(this.props, ['value', 'validator']);
    } else {
      return _omit(this.props, ['validator', 'defaultValue']);
    }
  }

  initState() {
    if (this._initialized) return;

    let value;
    const {name} = this.props;
    if (this._isCollectData) {
      this._collectState = new FormState({
        data: (this.value && this.value.data) || {},
        validator: this.validator,
        onStateChange: this.onStateChange
      });
      value = this._collectState;
    } else if (this.validator) {
      value = this.validator.validate(this.value);
    }

    // 更新 Form 的状态
    if (value && this.form && this.form.update) {
      this.form.update({name, value});
    }

    this._value = value;
    this._initialized = true;
  }

  // 继承时可覆盖，设置联合校验等逻辑
  onStateChange = (state) => {
    this.triggerChange(state);
  }

  /**
   * 自主触发
   * @param  {Any}          value        dataset 数据`{data, isValid, results}`或者其它数据
   * @param  {DomEventLike} srcEvent     原始对象
   * @return {undefined}
   */
  triggerChange = (valueArg, srcEvent) => {
    srcEvent && srcEvent.stopPropagation && srcEvent.stopPropagation();

    let value = valueArg;
    if (!this._isCollectData && this.validator) {
      value = this.validator.validate(valueArg);
    }

    if (this.props.onChange) {
      this.props.onChange(value);
      return;
    }

    this.form.updateState({
      value,
      name: this.props.name,
    });
  };

  renderFormControl() {
    return null;
  }

  render() {
    const {className, name, children} = this.props;
    const inputAttrs = {name, ref: '_input', type: 'text'};
    let customChildren = this.renderFormControl();

    if (!customChildren && children) {
      this._isCollectData = true;
      customChildren = children;
    }

    // 依赖 this._isCollectData 所以不能放在最前面
    this.initState();

    const formControlAttrs = {
      className: 'form-control ' + (className || '')
    };

    return (
      <div {...formControlAttrs}>
        {this._isCollectData && customChildren
          ? (
            <Form
              name={name}
              className='form-control-state'
              state={this._collectState}
            >{customChildren}</Form>
          ) : customChildren}
      </div>
    );
  }
}
