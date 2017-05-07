import {Component} from 'react';
import Form, {FormState, FormField, FormControl} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const vajs = FormState.vajs;

function MyComponent(props) {
  return (
    <button
      onClick={() => {
        props.onChange(Math.random());
      }}
    >
      点我
    </button>
  );
}

class MyFormControl extends FormControl {
  _validator = vajs.number({max: 0.3});

  renderFormControl() {
    return <MyComponent onChange={this.triggerChange} />;
  }
}

class CustomFormControlForm extends Component {
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
在现实场景中，很多复杂组件并不是简单使用原生的 control 元素就可以实现功能，
这时我们一般会对其进行封装，并暴露出 API （如：onChange，但是参数并不是 Event 对象），
这是我们可以通过 FormControl.triggerChange 方法让其支持事件冒泡。
        `}</Markdown>
        <Form
          state={this.formState}
        >
          <FormField name='foo' label='我的数据' isExplainInline={false}>
            <MyFormControl name='foo' />
          </FormField>
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default CustomFormControlForm;

function createFormState(onStateChange) {
  return new FormState({
    data: {},
    validator: vajs.map({
      foo: vajs.number({max: 0.5})
    }),
    onStateChange
  });
}
