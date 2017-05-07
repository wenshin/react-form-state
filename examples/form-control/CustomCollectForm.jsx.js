import {Component} from 'react';
import Form, {FormState, FormField, FormControl, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const vajs = FormState.vajs;

class MyFormControl extends FormControl {
  _validator = vajs.map({
    foo1: vajs.number({max: 10})
  });

  _isCollectData = true;

  renderFormControl() {
    return (
      <div>
        <div>
          <label>foo1: <input name='foo1' /></label>
          <ExplainText validResult={this.result.foo1} defaultExplain='最大不超过10' inline />
        </div>
        <div>
          <label>foo2: <input name='foo2' /></label>
          <ExplainText validResult={this.result.foo2} defaultExplain='可选' inline />
        </div>
        <div>
          <label>foo3: <input name='foo3' /></label>
          <ExplainText validResult={this.result.foo3} defaultExplain='可选' inline />
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
下例的 Form 功能和上一个直接使用 FormControl 采集数据的例子是一样的，
但是代码可维护性和重用性更好。
        `}</Markdown>
        <Form
          state={this.formState}
        >
          <FormField name='collected' label='收集数据' isExplainInline={false}>
            <MyFormControl />
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
    data: {},
    validator: vajs.map({
      collected: vajs.v((val) => {
        const isValid = val.foo1 && val.foo2 && val.foo3;
        if (!isValid) {
          return new vajs.Result({value: val, isValid: false, message: '所有字段不能为空'});
        }
        return isValid;
      })
    }),
    onStateChange
  });
}
