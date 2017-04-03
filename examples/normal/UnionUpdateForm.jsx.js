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
            label='姓名'
            name='name'
            defaultExplain='请输入最多5个字符，且不能和父亲姓名一样'
            required
          />
          <TextField
            type='textarea'
            label='昵称'
            name='nickname'
            isExplainInline={false}
            defaultExplain='请输入最多3个字符'
            required
          />
          <TextField
            label='父亲姓名'
            name='fathername'
            isExplainInline={false}
            defaultExplain='请输入最多5个字符，且不能和子女姓名一样'
            required
          />
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default UnionUpdateForm;


const nameValidator = vajs.string({maxLength: 5});
function createFormState(onStateChange) {
  return new FormState({
    data: {
      name: 'name',
      nickname: '',
    },
    validator: vajs.map({
      name: vajs.v((val, state) => {
        let result = nameValidator.validate(val);
        if (result.isValid && state.data.fathername === val) {
          result = new vajs.Result({isValid: false, message: '不能和父亲名字一样'});
        }
        return result;
      }),
      nickname: vajs.string({maxLength: 3}),
      fathername: vajs.v((val, state) => {
        let result = nameValidator.validate(val);
        if (result.isValid && state.data.name === val) {
          result = new vajs.Result({isValid: false, message: '不能和子女名字一样'});
        }
        return result;
      })
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
