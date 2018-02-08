import {Component} from 'react';
import Form, {FormState, Control} from 'react-form-state';
import Markdown from '../Markdown.jsx';

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

class ControlUseWithoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foo: 0
    };
  }

  onChange = (foo) => {
    this.setState({foo});
  }

  render() {
    return (
      <section>
        <Markdown>{`
有些时候当我们封装了 FormControl 以后有些场景，并不一定需要一个 Form 来使用 FormControl。
我们这是可以使用正常的受限组件模式来使用。[React 受限组件](https://facebook.github.io/react/docs/forms.html)
        `}</Markdown>
        <div>
          <MyFormControl value={this.state.foo} onChange={this.onChange} />
          <pre>{JSON.stringify(this.state.foo, null, 2)}</pre>
          <br />
        </div>
      </section>
    );
  }
}

export default ControlUseWithoutForm;
