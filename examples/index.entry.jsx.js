import vajs from 'vajs';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Form, {FormField, TextField, FormControl} from 'react-form-data';

import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-okaidia.css';
import 'react-form-data/style.less';

window.addEventListener('load', function() {
  require(['prismjs', 'prismjs/components/prism-jsx']);
});

window.React = React;

const validator = vajs.map({
  name: vajs.string({maxLength: 5}),
  nickname: vajs.string({maxLength: 2})
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      normalForm: {
        data: {
          name: '',
          nickname: '',
        }
      },
      collectForm: {
        data: {}
      }
    };
  }

  onNormalFormChange = (formState) => {
    if (formState.nameChanged === 'name') {
      formState.data.nickname = formState.data.name;
    }
    this.setState({normalForm: formState});
  }

  onCollectFormChange = (formState) => {
    this.setState({collectForm: formState});
  }

  render() {
    const {normalForm, collectForm} = this.state;
    return (
      <div>
        <article>
          <section>
            <h1>常规使用</h1>
            <Form
              data={normalForm.data}
              onDataChange={this.onNormalFormChange}
              validator={validator}
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
              {JSON.stringify(normalForm.data)}
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
              data={collectForm.data}
              onDataChange={this.onCollectFormChange}
              validator={validator}
            >
              <FormField name='collected'>
                <FormControl>
                  <label>foo1: <input name='foo1' /></label>
                  <label>foo2: <input name='foo2' /></label>
                  <label>foo3: <input name='foo3' /></label>
                </FormControl>
              </FormField>
            </Form>
            <p>
              {JSON.stringify(collectForm.data)}
            </p>
          </section>
        </article>
      </div>
    );
  }
}


ReactDOM.render(<App />, window.document.getElementById('app'));
