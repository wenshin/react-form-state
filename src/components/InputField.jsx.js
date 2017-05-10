import Input from './Input.jsx';
import FormField from '../FormField.jsx';

function noop() {}

export default class InputField extends FormField {
  renderField() {
    const props = this.pickProps();
    return <Input {...props} />;
  }
}
