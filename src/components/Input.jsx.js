import FormControl from '../FormControl.jsx';

function noop() {}

export default class Input extends FormControl {
  renderFormControl() {
    // onChange 传入 noop 是为了避免 react 提示 input 从 uncontrolled 元素变为 controlled 元素
    const value = this.value || '';
    const props = this.pickProps();
    const onChange = props.onChange || noop;
    return props.type === 'textarea' ? (
      <textarea
        value={value}
        {...props}
        onChange={onChange}
      />
    ) : (
      <input
        type='text'
        value={value}
        {...props}
        onChange={onChange}
      />
    );
  }
}
