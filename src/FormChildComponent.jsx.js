import {Component, PropTypes} from 'react';
import Explain from './Explain';

/**
 * FormChildComponent 表单元素组件的基类
 * 提供 context 初始化，以及获取表单状态函数
 */
export default class FormChildComponent extends Component {
  static contextTypes = {
    form: PropTypes.object
  };

  static formatResult = formatResult;
  static formatStateResult = formatStateResult;


  get form() {
    const {form} = this.context;
    return form || {};
  }

  get formData() {
    return this.form.data || {};
  }

  get formExplains() {
    return formatStateResult(this.form.result);
  }

  get formValue() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.formData[name];
  }

  get formExplain() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return formatResult(this.form.result[name]);
  }

  get formValidator() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.form.validator && this.form.validator.get(name);
  }
}


function formatStateResult(result) {
  const explains = {};
  for (const key of Object.keys(result)) {
    explains[key] = formatResult(result[key]);
  }
  return explains;
}


function formatResult(result) {
  if (result) {
    if (result.isValid) {
      return Explain.success('ok');
    }
    return Explain.fail(result.message);
  }
  return null;
}
