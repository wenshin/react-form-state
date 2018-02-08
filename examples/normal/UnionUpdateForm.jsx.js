import {Component} from 'react';
// 目前只发包了 @myfe/react-form-state，实际使用时，请使用 @myfe/react-form-state
import Form, {Field, FormState, Control, Input, InputField} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';

const {vajs} = FormState;

const cities = [{name: '北京', value: 'beijing'}, {name: '广州', value: 'guangzhou'}];
const noop = () => {};

class UnionUpdateForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState((state) => {
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
        <p>
          这个例子展示了 react-form-state 如何简洁地实现非常复杂的联合校验场景。
          在这个例子中，我们可以看到，在 Form 组件中采集数据时，既可以是原生的 input、textarea 等控件，
          也可以是通过 Control 包裹的组件
        </p>
        <Form state={this.formState}>
          <InputField
            label='姓名'
            name='name'
            defaultExplain='请输入最多5个字符，且不能和父亲姓名一样'
            required
          />
          <InputField
            type='textarea'
            name='nickname'
            label='昵称'
            isExplainInline={false}
            defaultExplain='请输入最多3个字符'
            required
          />
          <Field
            label='父亲姓名'
            name='fathername'
            isExplainInline={false}
            defaultExplain='请输入最多5个字符，且不能和子女姓名一样'
            required
          >
            {/*
              如果 Field 只包裹一个子元素，那么 name 属性可以省略。
              一旦设置 value 属性，React 就认为是受限组件，会提示必须传入 onChange，
              即使在 react-form-state 场景下它并不是必要的。
              警告内容：Failed form propType: You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field。
            */}
            <input value={data.fathername} onChange={noop} />
          </Field>
          <Field
            label='性别'
            name='sex'
            required
            defaultExplain='是不是人妖，你说？'
          >
            <Control><input type='checkbox' /></Control>
          </Field>
          <Field name='city' label='城市'>
            {/*
              如果没有初始值用于初始化，那么我们可以不设置 value 和 onChange 即非受限组件
            */}
            <select>
              {this.renderCityOptions()}
            </select>
          </Field>
          <Field label='其它'>
            <label>
              <Control
                name='other'
                valueKey='checked'
                formatValue={v => v === 'other1'}
              >
                <input type='radio' value='other1' />
              </Control>
              其它1
            </label>
            <label>
              <input
                type='radio'
                name='other'
                value='other2'
                checked={data.other === 'other2'}
                onChange={noop}
              />其它2
            </label>
          </Field>
          <Field label='描述'>
            <p>contentEditable 的元素不能实时刷新，会丢失焦点</p>
            <div
              name='desc'
              style={{border: 'solid 1px red'}}
              contentEditable
              dangerouslySetInnerHTML={ {__html: data.desc} }
            />
          </Field>
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
      fathername: 'foo',
      other: 'other1',
      desc: '123'
    },
    validator: vajs.map({
      name: vajs.v((val, {state}) => {
        let result = nameValidator.validate(val);
        if (result.isValid && state.data.fathername === val) {
          result = new vajs.Result({isValid: false, message: '不能和父亲名字一样'});
        }
        return result;
      }),
      nickname: vajs.string({maxLength: 3}),
      fathername: vajs.v((val, {state}) => {
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
