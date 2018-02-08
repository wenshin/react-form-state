import {Component} from 'react';
import Form, {FormChild, FormState, Field, Control, ControlCollector, ExplainText} from 'react-form-state';
import FormFooterField from '../FormFooterField.jsx';
import Markdown from '../Markdown.jsx';

const {vajs} = FormState;

const formCtrlValidator = vajs.map({
  foo1: vajs.number({max: 10})
});

class MyControlCollector extends FormChild {
  render() {
    const results = this.form.getResultsOf(this.props.name);
    return (
      <ControlCollector {...this.props} validator={formCtrlValidator}>
        <div>
          <label>foo1: <Control name='foo1'><input /></Control></label>
          <ExplainText
            validResult={results.foo1}
            defaultExplain='最大不超过10'
            inline
          />
        </div>
        <div>
          <label>foo2: <Control name='foo2'><input /></Control></label>
          <ExplainText
            validResult={results.foo2}
            defaultExplain='可选'
            inline
          />
        </div>
        <div>
          <label>foo3: <Control name='foo3'><input /></Control></label>
          <ExplainText
            validResult={results.foo3}
            defaultExplain='可选'
            inline
          />
        </div>
      </ControlCollector>
    );
  }
}

class CollectForm extends Component {
  constructor(props) {
    super(props);
    this.formState = createFormState(() => {
      this.forceUpdate();
    });
  }

  renderCollector(props = {}) {
    const results = this.formState.getResultsOf(props.name);
    return (
      <ControlCollector {...props}>
        <div>
          <label>foo1: <Control name='foo1'><input /></Control></label>
          <ExplainText
            validResult={results.foo1}
            defaultExplain='最大不超过10'
            inline
          />
        </div>
        <div>
          <label>foo2: <Control name='foo2'><input /></Control></label>
          <ExplainText
            validResult={results.foo2}
            defaultExplain='可选'
            inline
          />
        </div>
        <div>
          <label>foo3: <Control name='foo3'><input /></Control></label>
          <ExplainText
            validResult={results.foo3}
            defaultExplain='可选'
            inline
          />
        </div>
      </ControlCollector>
    );
  }

  render() {
    return (
      <section>
        <Markdown>{`
下例中 collected 字段在 FormState 本身提供校验“必须 foo1、foo2、foo3 有值”，
而给 Control 传入的 validator 属性，提供校验“foo1 值必须小于10，foo2、foo3 是可选的”的能力。

collectedSelfValiation 字段具有一样的功能，但是却是通过传入参数实现
collectedCustom 字段具有一样的功能，但是却是通过继承封装实现

> **注意：**如果使用 ControlCollector 传入校验或者封装时自带校验，
> 那么在首次渲染时，formState.isValid 的值需要等到页面渲染完后才会得到最终的结果，
> 所以应当把提交按钮放到页面底部，并且不能提前把 isValid 的值缓存到变量中。
        `}</Markdown>
        <Form state={this.formState}>
          <Field name='collected' label='FormState校验' isExplainInline={false}>
            {this.renderCollector({name: 'collected'})}
          </Field>
          <Field name='collectedSelfValiation' label='传入校验' isExplainInline={false}>
            {this.renderCollector({
              name: 'collectedSelfValiation',
              validator: formCtrlValidator
            })}
          </Field>
          <Field name='collectedCustom' label='继承封装' isExplainInline={false}>
            <MyControlCollector />
          </Field>
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
      collected: {},
      collectedSelfValiation: {},
      collectedCustom: {},
    },
    validator: vajs.map({
      collected: vajs.v((value) => {
        const subResult = formCtrlValidator.validate(value);
        return formValidate(value, subResult);
      }),
      collectedSelfValiation: vajs.v((value, extra) => {
        const {subResult} = extra;
        return formValidate(value, subResult);
      }),
      collectedCustom: vajs.v((value, extra) => {
        const {subResult} = extra;
        return formValidate(value, subResult);
      }),
    }),
    onStateChange
  });
}

function formValidate(value, subResult) {
  const result = new vajs.Result();
  result.results = subResult.results;

  const isEmpty = !value.foo1 || !value.foo2 || !value.foo3;
  if (isEmpty) {
    result.isValid = false;
    result.message = '所有字段不能为空';
  } else {
    result.isValid = subResult.isValid;
    result.message = subResult.isValid ? 'Bravo！' : '校验失败！';
  }
  return result;
}
