import Explain from './Explain';
import FormState from './FormState';

import Form from './Form.jsx';
import ExplainBase from './ExplainBase.jsx';
import ExplainText from './ExplainText.jsx';
import FormField from './FormField.jsx';
import FormControl from './FormControl.jsx';
import FormChild from './FormChild.jsx';
import FormGroup from './FormGroup.jsx';
import fc, {createFormControl} from './createFormControlElement.jsx';
import Input from './components/Input.jsx';
import InputField from './components/InputField.jsx';

export default Form;

export {
  FormState,

  Explain,
  ExplainBase,
  ExplainText,
  FormField,
  FormControl,
  FormChild,
  FormGroup,
  /**
   * 自定义封装的常用组件
   */
  Input,
  InputField,

  /**
   * FormControl 工厂函数
   */
  fc,
  createFormControl,
};
