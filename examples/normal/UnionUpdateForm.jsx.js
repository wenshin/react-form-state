import {Component} from 'react';
// 目前只发包了 @myfe/react-form-state，实际使用时，请使用 @myfe/react-form-state
import Form, {FormField, FormState, Input, InputField} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';

const vajs = FormState.vajs;

const cities = [{name: '北京', value: 'beijing'}, {name: '广州', value: 'guangzhou'}];

class UnionUpdateForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  renderCityOptions() {
    return cities.map((city) => {
      return (
        <option
          key={city.value}
          value={city.value}
        >{city.name}</option>
      );
    });
  }

  render() {
    const {data} = this.formState;

    return (
      <section>
        <p>当表单中的某个字段依赖另外一个字段的时候，我们需要联合更新该字段并进行校验</p>
        <Form state={this.formState}>
          <InputField
            label='姓名'
            name='name'
            defaultExplain='请输入最多5个字符，且不能和父亲姓名一样'
            required
          />
          <InputField
            type='textarea'
            label='昵称'
            name='nickname'
            isExplainInline={false}
            defaultExplain='请输入最多3个字符'
            required
          />
          <InputField
            label='父亲姓名'
            name='fathername'
            isExplainInline={false}
            defaultExplain='请输入最多5个字符，且不能和子女姓名一样'
            required
          />
          <InputField
            label='性别'
            name='sex'
            type='checkbox'
            isExplainInline={false}
            required
          >
            人妖：）
          </InputField>
          <FormField label='城市'>
            <select name='city' value={data.city} onChange={() => {}}>
              {this.renderCityOptions()}
            </select>
          </FormField>
          <FormField label='其它'>
            <label>
              {/* 使用React 原生支持的 input 标签，
                  如果有 checked 属性但是没有 onChange 事件，
                  checkbox 和 radio 会被设置为 read-only。
                  感觉这个封装好无聊:)*/}
              <Input
                type='radio'
                name='other'
                value='other1'
                checked={data.other === 'other1'}
              />其它1</label>
            <label>
              <Input
                type='radio'
                name='other'
                value='other2'
                checked={data.other === 'other2'}
              />其它2</label>
          </FormField>
          <FormField label='描述'>
            <p>contentEditable 的元素不能实时刷新，会丢失焦点</p>
            <div
              name='desc'
              style={{border: 'solid 1px red'}}
              contentEditable
              dangerouslySetInnerHTML={ {__html: data.desc} }
            >
            </div>
          </FormField>
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
      other: 'other1',
      city: 'guangzhou',
      desc: '123'
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
      // contentEditable 元素变更不能刷新，否则会丢失 Cursor
      if (state.nameChanged === 'desc') {
        console.log('update editable data', state.data.desc);
        return;
      }

      if (state.nameChanged === 'name') {
        // 联合更新
        state.update({
          name: 'nickname',
          value: state.data.name.slice(0, 4)
        });
        // 联合校验
        state.validateOne({name: 'fathername'});
      }
      if (state.nameChanged === 'fathername') {
        // 联合校验
        state.validateOne({name: 'name'});
      }
      onStateChange(state);
    }
  });
}
