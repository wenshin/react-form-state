import {PropTypes} from 'react';

import Explain from './Explain';
import FormState from './FormState';

import DataSet from './DataSet.jsx';
import ExplainBase from './ExplainBase.jsx';
import ExplainText from './ExplainText.jsx';
import FormField from './FormField.jsx';
import FormControl from './FormControl.jsx';
import FormChild from './FormChild.jsx';
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

  constructor(props) {
    super(props);
    props.state.formatResult = function formatResult(result) {
      if (result) {
        if (result.isValid) {
          return Explain.success('ok');
        }
        return Explain.fail(result.message);
      }
      return null;
    };
  }

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

export class FormGroup extends FormChild {
  render() {
    const {title, children} = this.props;
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
  ExplainBase,
  ExplainText,
  FormField,
  FormState,
  TextField,
  FormControl,
  FormChild
};
