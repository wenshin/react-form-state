import {PropTypes} from 'react';
import ReactTooltip from 'react-tooltip';

import DataSet from './DataSet.jsx';
import HelpTips from './help-tip';
import Explain from './Explain.jsx';
import ExplainText from './ExplainText.jsx';
import FormField from './FormField.jsx';
import FormControl from './FormControl.jsx';
import FormChildComponent from './FormChildComponent.jsx';
import TextField from './form-fields/TextField.jsx';


/**
 * 表单包裹组件
 * 用法
 *
 * ```
 * import {Component, PropTypes} from 'react';
 * import vajs from 'vajs';
 *
 * const validators = vajs.map([
 *   ['a', vajs.require()],
 *   ['b', vajs.number(commonValid)],
 *   ['testField', vajs.number()],
 * ]);
 *
 * export default class ComponentName extends Component {
 *   handleChangeData({data, explains, changedName, isValid}) {
 *     // data 最新的所有数据
 *     // 校验错误
 *     // 变更的字段名
 *   }
 *
 *   render() {
 *     return (
 *       <Form onDataChange={this.handleChangeData.bind(this)} validator={validators}>
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
    return {form: this};
  }

  renderSubDataSet() {
    let {className, children} = this.props;
    return (
      <div className={`form ${className || ''}`}>
        {children}
        <ReactTooltip multiline />
      </div>
    );
  }
}

export class FormGroup extends FormChildComponent {
  render() {
    let {title, children} = this.props;
    return (
      <div className='form__group'>
        {title ? (
          <h2
            className='form__group-title'
            dangerouslySetInnerHTML={{__html: title}}
          />
        ) : null}
        {children}
      </div>
    );
  }
}

export function FormStaticText(props) {
  const {children, className} = props;
  return (
    <span {...props} className={`form__static-text ${className || ''}`}>{children}</span>
  );
}

export {
  DataSet,
  Explain,
  ExplainText,
  FormField,
  TextField,
  FormControl,
  FormChildComponent,
  HelpTips
};
