import {Component} from 'react';
import Form, {FormState, InputField} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';

const vajs = FormState.vajs;

class AsyncValidationForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <section>
        <p>表单中实现异步校验</p>
        <Form state={this.formState}>
          <InputField
            type='text'
            label='异步校验'
            name='async'
            defaultExplain='请输入最多5个字符的名称'
            required
          />
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default AsyncValidationForm;

function createFormState(onStateChange) {
  return new FormState({
    data: {
      name: 'test',
      nickname: '',
    },
    validator: vajs.map({
      async: vajs.v(remoteValidate)
    }),
    onStateChange
  });
}

function remoteValidate(val) {
  return new Promise((resolve, reject) => {
    clearTimeout(remoteValidate.timer);
    remoteValidate.timer = setTimeout(() => {
      setTimeout(() => {
        try {
          resolve(vajs.string({maxLength: 5}).validate(val));
        } catch (err) {
          reject(err);
        }
      }, 500);
    }, 500);
  });
}
