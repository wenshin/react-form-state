import React from 'react';
import FormChild from '../FormChild.jsx';

function noop() {}

export default class Input extends FormChild {
  render() {
    // onChange 传入 noop 是为了避免 react 提示 input 从 uncontrolled 元素变为 controlled 元素
    const value = this.formValue || '';
    const props = Object.assign({}, this.props);
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
