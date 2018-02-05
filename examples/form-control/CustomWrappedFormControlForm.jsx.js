import {Component} from 'react';
import Form, {fc, FormState, FormField} from 'react-form-state';
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

class CustomWrappedFormControlForm extends Component {
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
大部分情况下，如控件模式1中通过继承封装我们需要的 FormControl 一样，都非常的简单而且标准化，
所以我们提供 fc 方法避免这种无意义的重复代码。
        `}</Markdown>
        <Form state={this.formState}>
          <FormField name='foo' label='我的数据' isExplainInline={false}>
            {fc(MyComponent, {
              name: 'foo',
              validator: vajs.number({min: 0.3})
            })}
          </FormField>
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default CustomWrappedFormControlForm;

function createFormState(onStateChange) {
  return new FormState({
    data: {
      foo: null
    },
    onStateChange
  });
}
