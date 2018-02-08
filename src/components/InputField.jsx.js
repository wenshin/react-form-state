import Input from './Input.jsx';
import Field from '../Field.jsx';

export default class InputField extends Field {
  renderField() {
    const props = this.pickProps();
    props.children = undefined;
    props.dangerouslySetInnerHTML = undefined;
    return <Input {...props} />;
  }
}
