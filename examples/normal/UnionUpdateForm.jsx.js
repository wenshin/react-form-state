import vajs from 'vajs';
import {Component} from 'react';
import Form, {FormState, TextField} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';

class UnionUpdateForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <section>
        <p>当表单中的某个字段依赖另外一个字段的时候，我们需要联合更新该字段并进行校验</p>
        <Form state={this.formState}>
          <TextField
            type='text'
            label='Name'
            name='name'
            defaultExplain='请输入最多5个字符的名称'
            required
          />
          <TextField
            type='textarea'
            label='Nick Name'
            name='nickname'
            isExplainInline={false}
            defaultExplain='请输入最多3个字符的名称'
            required
          />
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default UnionUpdateForm;

function createFormState(onStateChange) {
  return new FormState({
    data: {
      name: 'test',
      nickname: '',
    },
    validator: vajs.map({
      name: vajs.string({maxLength: 5}),
      nickname: vajs.string({maxLength: 3})
    }),
    onStateChange(state) {
      if (state.nameChanged === 'name') {
        // 联合更新
        state.update('nickname', state.data.name.slice(0, 4));
      }
      onStateChange(state);
    }
  });
}
