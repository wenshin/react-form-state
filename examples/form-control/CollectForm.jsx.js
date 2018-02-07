import {Component} from 'react';
import Form, {Util, FormState, FormField, FormControl, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const vajs = FormState.vajs;

const formCtrlValidator = vajs.map({
  foo1: vajs.number({max: 10})
});

class CollectFormTopValidation extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  render() {
    const {data} = this.formState;
    const collected = data.collected || {};
    const results = this.formState.getResultsOf('collected');
    return (
      <section>
        <Markdown>{`
FormControl 直接使用，可以自动监听子元素的 onChange 事件冒泡，
并把数据合并为一个 FormState 的实例。

下例中 Form 本身提供校验“必须 foo1、foo2、foo3 有值”，
给 FormControl 传入 validator 属性，提供校验“foo1 值必须小于10，
而 foo2、foo3 是可选的”。
        `}</Markdown>
        <Form state={this.formState}>
          <FormField name='collected' label='收集数据' isExplainInline={false}>
            <FormControl validator={formCtrlValidator}>
              <div>
                <label>foo1: <input name='foo1' value={collected.foo1} /></label>
                <ExplainText
                  validResult={results.foo1}
                  defaultExplain='最大不超过10'
                  inline
                />
              </div>
              <div>
                <label>foo2: <input name='foo2' value={collected.foo2} /></label>
                <ExplainText
                  validResult={results.foo2}
                  defaultExplain='可选'
                  inline
                />
              </div>
              <div>
                <label>foo3: <input name='foo3' value={collected.foo3} /></label>
                <ExplainText
                  validResult={results.foo3}
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

export default CollectFormTopValidation;

function createFormState(onStateChange) {
  return new FormState({
    data: {
      collected: {}
    },
    validator: vajs.map({
      collected: vajs.v((value, extra) => {
        const {subResult} = extra;
        const result = new vajs.Result({value});
        const isEmpty = !value.foo1 || !value.foo2 || !value.foo3;
        if (isEmpty) {
          result.isValid = false;
          result.message = '所有字段不能为空';
        } else {
          result.isValid = subResult.isValid;
          result.message = subResult.isValid ? 'Bravo！' : '校验失败！';
        }
        return result;
      })
    }),
    onStateChange
  });
}
