import {Component, PropTypes} from 'react';

/**
 * FormChildComponent 表单元素组件的基类
 * 提供 context 初始化，以及获取表单状态函数
 */
export default class FormChildComponent extends Component {
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

  get formDefaultData() {
    return this.form.defaultData || {};
  }

  get formExplains() {
    return this.form.explains || {};
  }

  get formDefaultExplains() {
    return this.form.defaultExplains || {};
  }

  get formValue() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.formData[name];
  }

  get formDefaultValue() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.formDefaultData[name];
  }

  get formExplain() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.formExplains[name];
  }

  get formDefaultExplain() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.formDefaultExplains[name];
  }

  get formValidator() {
    const {name} = this.props; // eslint-disable-line react/prop-types
    return this.form.validator && this.form.validator.get(name);
  }
}
