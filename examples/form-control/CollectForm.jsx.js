import {Component} from 'react';
import Form, {FormState, FormField, FormControl, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const vajs = FormState.va;

const formCtrlValidator = vajs.map({
  foo1: vajs.number({max: 10})
});

class CollectForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  render() {
    const collectedResults = this.formState.getNestResult('collected');
    return (
      <section>
        <Markdown>{`
FormControl 直接使用，可以自动监听子元素的 onChange 事件冒泡，
并把数据合并为一个对象。同时 FormControl 允许自定义 validator，
这可以有效的重用校验逻辑。

下例中 Form 本身提供校验“必须 foo1、foo2、foo3 有值”，
且 FormControl 自身也提供校验“foo1 值必须小于10，foo2、foo3 是可选的”。
        `}</Markdown>
        <Form
          state={this.formState}
        >
          <FormField name='collected' label='收集数据' isExplainInline={false}>
            <FormControl validator={formCtrlValidator}>
              <div>
                <label>foo1: <input name='foo1' /></label>
                <ExplainText
                  validResult={collectedResults.foo1}
                  defaultExplain='最大不超过10'
                  inline
                />
              </div>
              <div>
                <label>foo2: <input name='foo2' /></label>
                <ExplainText
                  validResult={collectedResults.foo2}
                  defaultExplain='可选'
                  inline
                />
              </div>
              <div>
                <label>foo3: <input name='foo3' /></label>
                <ExplainText
                  validResult={collectedResults.foo3}
                  defaultExplain='可选'
                  inline
                />
              </div>
            </FormControl>
          </FormField>
          <FormFooterField />
        </Form>
      </section>
    );
  }
}

export default CollectForm;

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
    // 如果 FormControl 自带校验失败，Form 校验成功，那么得到默认的错误信息 'validation fail'。
    // 通过自定义 nestFailMessage 可以修改。
    nestFailMessage: '校验失败！',
    onStateChange
  });
}
