import {PropTypes} from 'react';
import Explain from './Explain';
import DataSet from './DataSet.jsx';

/**
 * 表单包裹组件
 * 用法
 *
 * ```
 * import {Component, PropTypes} from 'react';
 * import vajs from 'vajs';
 *
 * const validator = vajs.map([
 *   ['a', vajs.require()],
 *   ['b', vajs.number(commonValid)],
 *   ['testField', vajs.number()],
 * ]);
 *
 * export default class ComponentName extends Component {
 *   render() {
 *     return (
 *       <Form state={new FormState({data: {a: 1}, validator})}>
 *         <FormField>
 *           <input name='a' value defaultValue/>
 *         </FormField>
 *         <FormField>
 *           <input name='b' value defaultValue/>
 *         </FormField>
 *         <FormField>
 *           <TestFormControl name='testFields'/>
 *         </FormField>
 *       </Form>
 *     );
 *   }
 * }
 *
 * class TestFormControl extends FormControl {
 *   handleChange(e) {
 *     this.triggerChange({value: e.target.value}, e);
 *   }
 *
 *   renderFormControl() {
 *     let {value} = this.props;
 *     let attrs = {
 *       onChange: this.handleChange.bind(this)
 *     };
 *     value !== undefined && (attrs.value = value);
 *     return <input {...attrs}/>;
 *   }
 * }
 * ```
 */
export default class Form extends DataSet {
  static childContextTypes = {
    form: PropTypes.object
  };

  getChildContext() {
    return {form: this.props.state};
  }

  renderChildren() {
    const {className, children} = this.props;
    return (
      <div className={`form ${className || ''}`}>
        {children}
      </div>
    );
  }
}
