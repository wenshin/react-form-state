import {Component} from 'react';
import Form, {createFormControl, FormState, FormField, FormControl} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const {vajs} = FormState;

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
  _validator = vajs.number({min: 0.3});

  renderFormControl() {
    return <MyComponent onChange={this.triggerChange} />;
  }
}

const MyFormControl1 = createFormControl(MyComponent, {
  isCollectData: false, // 可选，默认值为 false
  validator: vajs.number({min: 0.3}), // 可选，默认值 null
  changeHandlerProp: 'onChange', // 可选，默认值为 'onChange'
});

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
我们一般会将其封装并暴露出 API （如：onChange，但是参数并不是 Event 对象）。
但是这会绑定很多事件，尤其是当表单很复杂的时候，这种场景会很难维护。
这时我们希望自定义控件，并且能够多处使用。

这是我们可以通过 FormControl.triggerChange 方法让其支持事件冒泡。
在此
        `}</Markdown>
        <Form state={this.formState}>
          <FormField name='foo' label='我的数据' isExplainInline={false}>
            <MyFormControl name='foo' />
          </FormField>
          <FormField name='bar' label='By工厂函数' isExplainInline={false}>
            <MyFormControl1 name='bar' />
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
    data: {
      foo: null,
      bar: null
    },
    onStateChange
  });
}
