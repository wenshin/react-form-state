import {Component} from 'react';
import Form, {Util, FormState, FormField, FormControl, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const vajs = FormState.vajs;

const formCtrlValidator = vajs.map({
  foo1: vajs.number({max: 10}),
  foo2: vajs.require(false),
  foo3: vajs.require(false),
});

class CollectForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  render() {
    const collected = this.formState.data.collected;
    const collectedResult = this.formState.results.collected || {results: {}};
    return (
      <section>
        <Markdown>{`
同样是实现 Form 本身提供校验“必须 foo1、foo2、foo3 有值”，
但是不是通过 FormControl 传入 validator 属性，
而是直接在 Form 的 validator 中实现。
> **注意：**如果使用 FormControl 自带校验，在首次渲染时，formState.isValid 的值
> 需要等到页面渲染完后才会得到最终的结果，
> 所以应当把提交按钮放到页面底部，并且不能提前把 isValid 的值缓存到变量中。
        `}</Markdown>
        <Form state={this.formState}>
          <FormField name='collected' label='收集数据' isExplainInline={false}>
            <FormControl>
              <div>
                <label>foo1: <input name='foo1' value={collected.foo1} /></label>
                <ExplainText
                  validResult={collectedResult.results.foo1}
                  defaultExplain='最大不超过10'
                  inline
                />
              </div>
              <div>
                <label>foo2: <input name='foo2' value={collected.foo2} /></label>
                <ExplainText
                  validResult={collectedResult.results.foo2}
                  defaultExplain='可选'
                  inline
                />
              </div>
              <div>
                <label>foo3: <input name='foo3' value={collected.foo3} /></label>
                <ExplainText
                  validResult={collectedResult.results.foo3}
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
    data: {
      collected: {data: {}, results: {}}
    },
    validator: vajs.map({
      collected: vajs.v((val) => {
        let result = new vajs.Result();
        const {data} = val;
        const result1 = formCtrlValidator.validate(data);
        result.results = result1.results;

        const isEmpty = !data.foo1 || !data.foo2 || !data.foo3;
        if (isEmpty) {
          result.isValid = false;
          result.message = '所有字段不能为空';
        } else {
          result.isValid = result1.isValid;
          result.message = result1.isValid ? 'Bravo！' : '校验失败！';
        }
        return result;
      })
    }),
    onStateChange
  });
}
