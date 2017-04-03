import {Component, PropTypes} from 'react';

/**
 * FormChild 表单元素组件的基类
 * 提供 context 初始化，以及获取表单状态数据
 */
export default class FormChild extends Component {
  static contextTypes = {
    form: PropTypes.object
  };

  get form() {
    const {form} = this.context;
    return form || {};
  }

  get formData() {
    return this.form.data || {};
  }

  get formResults() {
    return this.form.results;
  }

  get formValue() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.formData[name];
  }

  get formResult() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.form.results[name];
  }

  get formNestResult() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.form.getNestResult(name);
  }

  get formValidator() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.form.validator && this.form.validator.get(name);
  }
}
