import {Component} from 'react';
import Form, {Field, FormState, Control, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';

const {vajs} = FormState;

class MyFormControl extends Control {
  _validator = vajs.number({min: 0.3});

  onClick = () => {
    this.triggerChange(Math.random());
  }

  renderControl() {
    return (
      <button
        onClick={this.onClick}
      >
        点我
      </button>
    );
  }
}

class CustomControl extends Component {
  constructor(props) {
    super(props);
    this.formState = new FormState({
      data: {},
      onStateChange: () => {
        this.forceUpdate();
      }
    });
  }

  render() {
    return (
      <section>
        <p>Control 可以和 Field 一起使用，也可以独立使用</p>
        <Form state={this.formState}>
          <Field name='randomValue' label='Field 下使用'>
            <MyFormControl />
          </Field>
          <div>
            不和 Field 一起使用&nbsp;&nbsp;
            <MyFormControl name='randomValueWithoutFiled' />
            <ExplainText name='randomValueWithoutFiled' inline />
          </div>
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default CustomControl;
