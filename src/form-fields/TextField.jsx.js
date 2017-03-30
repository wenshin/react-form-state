import FormField from '../FormField.jsx';

function loop() {}

export default class InputField extends FormField {
  renderField() {
    const props = FormField.omitProps(this.props);
    // 避免 react 提示 input 从 uncontrolled 元素变为 controlled 元素
    const value = this.formValue || '';
    return props.type === 'textarea' ? (
      <textarea
        value={value}
        onChange={loop}
        {...props}
      />
    ) : (
      <input
        type='text'
        value={value}
        onChange={loop}
        {...props}
      />
    );
  }
}
