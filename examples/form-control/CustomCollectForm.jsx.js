import {Component} from 'react';
import Form, {Util, FormState, FormField, FormControl, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const vajs = FormState.vajs;

// 自动合并 vajs.map() 返回 validator
const customValidator = vajs.map({
  foo2: vajs.number({max: 5}),
});

class MyFormControl extends FormControl {
  _validator = vajs.map({
    foo1: vajs.number({max: 10}),
  });

  _isCollectData = true;

  renderFormControl() {
    const {data, results} = this.value;
    return (
      <div>
        <div>
          <label>foo1: <input name='foo1' value={data.foo1} /></label>
          <ExplainText validResult={results.foo1} defaultExplain='最大不超过10' inline />
        </div>
        <div>
          <label>foo2: <input name='foo2' value={data.foo2} /></label>
          <ExplainText validResult={results.foo2} defaultExplain='我是自定义的校验规则' inline />
        </div>
        <div>
          <label>foo3: <input name='foo3' value={data.foo3} /></label>
          <ExplainText validResult={results.foo3} defaultExplain='可选' inline />
        </div>
      </div>
    );
  }
}

class CustomCollectForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <section>
        <Markdown>{`
下例的 Form 功能通过继承对组件进行了更好的封装，同时展示了如果是收集模式，可以对 validator 进行合并
        `}</Markdown>
        <Form
          state={this.formState}
        >
          <FormField name='collected' label='收集数据' isExplainInline={false}>
            <MyFormControl validator={customValidator} />
          </FormField>
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default CustomCollectForm;

function createFormState(onStateChange) {
  return new FormState({
    data: {
      collected: {data: {}, results: {}}
    },
    validator: vajs.map({
      collected: vajs.v((val) => {
        const {data, isValid} = val;
        let result = new vajs.Result({value: data});
        const isEmpty = !data.foo1 || !data.foo2 || !data.foo3;
        if (isEmpty) {
          result.isValid = false;
          result.message = '所有字段不能为空';
        } else {
          result.isValid = isValid;
          result.message = isValid ? 'Bravo！' : '校验失败！';
        }
        return result;
      })
    }),
    onStateChange
  });
}
