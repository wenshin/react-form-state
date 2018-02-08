import React from 'react';
import PropTypes from 'prop-types';

import FormChild from './FormChild.jsx';
import util from './util';

export default class Control extends FormChild {
  static propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    validator: PropTypes.object,
    // Control 只支持受限组件
    value: PropTypes.any,
    children: PropTypes.element,
    // 子组件更新数据的属性名，默认是 'value'。例如 checkbox 元素是通过 'checked' 来更新组件数据
    valueKey: PropTypes.string,
    // 子组件数据重新格式化的方法
    formatValue: PropTypes.func,
    // 子组件数据变更事件的回调函数名，默认是 'onChange'
    onChangeKey: PropTypes.string,
  };

  static defaultProps = {
    valueKey: 'value',
    onChangeKey: 'onChange',
  }

  /**
   * 扩展 Control 的静态对象属性，比如 propTypes, defaultProps
   * @param  {String} propertyName 要扩展的属性名
   * @param  {Object} update       更新的值
   * @return {Object}              新的属性值
   */
  static extendsStatic(propertyName, update) {
    return Object.assign({}, Control[propertyName] || {}, update);
  }

  constructor(props) {
    super(props);
    // 非继承封装模式
    if (this.constructor === Control && React.Children.count(props.children) !== 1) {
      throw new Error('Control 非继承封装模式下，有且只能有一个子元素');
    }
    this._validator = null;
  }

  get value() {
    return this.props.value || this.formValue;
  }

  get validator() {
    if (this._validator
      && this._validator.size
      && this.props.validator
      && this.props.validator.size
    ) {
      this._validator.merge(this.props.validator);
      return this._validator;
    }
    return this.props.validator || this._validator;
  }

  componentWillMount() {
    let result;
    if (this.validator) {
      result = this.validator.validate(this.value);
    }

    // 更新 Form 的状态
    if (result && this.validator && this.form && this.form.update) {
      const {name} = this.props;
      if (!name) {
        throw new Error('name property is needed for Control');
      }
      this.form.update({
        name,
        result,
        value: this.value,
        notUpdateResult: true
      });
    }
  }

  /**
   * 自主触发
   * @param  {any}          value
   * @return {undefined}
   */
  triggerChange = (valueArg) => {
    let value = valueArg;
    // event
    if (valueArg && valueArg.stopPropagation && valueArg.target) {
      valueArg.stopPropagation();
      value = util.getEventData(valueArg).value; // eslint-disable-line prefer-destructuring
    }

    let result;
    if (!this._isCollectData && this.validator) {
      result = this.validator.validate(value);
    }

    if (this.props.onChange) {
      this.props.onChange(value, result);
      return;
    }

    const {name} = this.props;
    if (!name) {
      throw new Error('name property is needed for Control');
    }

    this.form.updateState({name, value, result});
  };

  /* eslint-disable class-methods-use-this */
  renderControl() {
    throw new Error('renderControl need been overrided');
  }
  /* eslint-enable class-methods-use-this */

  render() {
    let customChildren;
    const {
      name,
      children,
      valueKey,
      onChangeKey,
      formatValue
    } = this.props;

    if (!children) {
      customChildren = this.renderControl();
    } else {
      if (children.props[onChangeKey]) {
        throw new Error(`do not use ${onChangeKey} for children of Control. you can deal with change logic in FormState`);
      }

      const value = formatValue ? formatValue(this.value) : this.value;
      const props = {
        name,
        [valueKey]: value || '', // input 标签只有设置空字符串才能使得 React 不提示不受限组件变为受限组件
        [onChangeKey]: this.triggerChange,
      };

      customChildren = React.cloneElement(children, props);
    }

    return customChildren;
  }
}
