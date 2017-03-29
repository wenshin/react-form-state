import vajs from 'vajs';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Form, {FormState, FormField, TextField, FormControl, ExplainText} from 'react-form-data';

import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-okaidia.css';
import 'react-form-data/style.less';

window.addEventListener('load', function() {
  require(['prismjs', 'prismjs/components/prism-jsx']);
});

window.React = React;

class App extends Component {
  constructor(props) {
    super(props);
    const self = this;
    this.normalForm = new FormState({
      data: {
        name: 'test',
        nickname: '',
      },
      validator: vajs.map({
        name: vajs.string({maxLength: 5}),
        nickname: vajs.string({maxLength: 3})
      }),
      onStateChange(state) {
        if (state.nameChanged === 'name') {
          state.update('nickname', state.data.name.slice(0, 3));
        }
        self.forceUpdate();
      }
    });

    this.collectFormCtrlValidator = vajs.map({
      foo1: vajs.number({max: 10})
    });

    this.collectForm = new FormState({
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
      onStateChange(state) {
        self.forceUpdate();
      }
    });
  }

  render() {
    const collectedResults = this.collectForm.getNestResult('collected');
    return (
      <div>
        <article>
          <section>
            <h1>常规使用</h1>
            <Form
              state={this.normalForm}
            >
              <TextField
                type='text'
                label='Name'
                name='name'
                defaultExplain='请输入最多5个字符的名称'
                required
              />
              <TextField
                type='text'
                label='Nick Name'
                name='nickname'
                isExplainInline={false}
                defaultExplain='请输入最多2个字符的名称'
                required
              />
            </Form>
            <p>
              {JSON.stringify(this.normalForm.data)}
            </p>
          </section>
          <section>
            <h1>样例代码</h1>
            <pre>
              <code className='language-jsx'>{`
class FormPage extends Component {
  state = {
    data: {
      name: 'test'
    },
    explains: {},
    nameChanged: ''
  }

  onFormChange = ({data, explains, nameChanged}) => {
    this.setState({data, explains, nameChanged});
  }

  render() {
    <Form
      data={data}
      onDataChange={this.onFormChange}
      validator={validator}
    >
      <FormField
        label='Name'
        name='name'
        defaultExplain='请输入最多5个字符的名称'
        required
      >
        <input />
      </FormField>
      <FormField
        label='Nick Name'
        name='nickname'
        defaultExplain='请输入最多2个字符的名称'
        required
      >
        <input />
      </FormField>
    </Form>
  }
}
              `}</code>
            </pre>
          </section>
        </article>
        <article>
          <section>
            <h1>用 FormControl 采集数据</h1>
            <Form
              state={this.collectForm}
            >
              <FormField name='collected'>
                <FormControl validator={this.collectFormCtrlValidator}>
                  <div>
                    <label>foo1: <input name='foo1' /></label>
                    <ExplainText validResult={collectedResults.foo1} />
                  </div>
                  <div>
                    <label>foo2: <input name='foo2' /></label>
                    <ExplainText validResult={collectedResults.foo2} />
                  </div>
                  <div>
                    <label>foo3: <input name='foo3' /></label>
                    <ExplainText validResult={collectedResults.foo3} />
                  </div>
                </FormControl>
              </FormField>
            </Form>
            <p>
              {JSON.stringify(this.collectForm.data)}
            </p>
          </section>
        </article>
      </div>
    );
  }
}


ReactDOM.render(<App />, window.document.getElementById('app'));
