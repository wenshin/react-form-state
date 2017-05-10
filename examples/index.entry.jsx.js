import React from 'react';
import ReactDOM from 'react-dom';
import {InputField} from 'react-form-state';
import Markdown, {Code} from './Markdown.jsx';
import UnionUpdateForm from './normal/UnionUpdateForm.jsx';
import AsyncValidationForm from './normal/AsyncValidationForm.jsx';
import CollectForm from './form-control/CollectForm.jsx';
import CustomCollectForm from './form-control/CustomCollectForm.jsx';
import CustomFormControlForm from './form-control/CustomFormControlForm.jsx';
import FormFieldDisabledForm from './form-field/FormFieldDisabledForm.jsx';
import FormFooterField from './FormFooterField.jsx';

import './markdown.css';
import './markdown-theme5.css';
import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-okaidia.css';
import 'react-form-state/style.less';
import './style.css';

window.React = React;

function App() {
  return (
    <article>
      <section>
        <Markdown>{`
# react form state
是一个数据与 UI 分离，支持丰富的校验场景，支持轻松扩展的表单控件。

# 设计哲学
### UI 和 Form 数据处理逻辑分离
当表单存在复杂的校验，各个元素之间存在复杂的联合更新和联合校验时，
如果把所有逻辑都写在 UI 组件里，往往会让 UI 组件变得复杂且难以维护，
这时我们可能希望数据逻辑可以单独抽离出来处理。
另外一个场景，在不同的项目（使用不一样的 UI 解决方案）之间需要进行共享重复表单实现时，
这往往发生在内网和外网同时提供服务，PC 端和移动端同时提供服务，
我们期望表单的数据处理逻辑可以直接被复用。

### 样式最简
现实中，很多业务没有办法直接使用固定的样式，如果组件提供复杂的样式实现，将很大概率导致样式冲突。

### 事件冒泡
使用 onChange 事件冒泡自动搜集数据，去掉 React 在复杂表单中频繁的事件绑定，以及双向绑定中的额外函数绑定。
        `}</Markdown>
      </section>

      <section>
        <h1>使用指南</h1>
        <section>
          <Markdown>{`
### 引入文件
同时引入 js 和 css。

- \`import Form from '@myfe/react-form-state'\`
- \`<link rel="stylesheet" href="path/to/@myfe/react-form-state/style.css"></link>\`
- \`import Form from '@myfe/react-form-state/webpack' 当你使用 webpakc，会自动引入 style.css\`
          `}</Markdown>
        </section>

        <section>
          <h3>联合更新和校验</h3>
          <UnionUpdateForm />
          <section>
            <Code lang='jsx' code={UnionUpdateForm.srcContent} />
          </section>
        </section>

        <section>
          <h3>服务器端校验</h3>
          <AsyncValidationForm />
          <section>
            <Code lang='jsx' code={AsyncValidationForm.srcContent} />
          </section>
        </section>

        <section>
          <Markdown>{`
### FormControl 表单元素
> FormControl 不支持嵌套 FormControl
        `}</Markdown>
          <section>
            <h4>用 FormControl 采集数据</h4>
            <CollectForm />
            <section>
              <Code lang='jsx' code={CollectForm.srcContent} />
            </section>
          </section>
          <section>
            <h4>继承 FormControl 封装采集数据</h4>
            <CustomCollectForm />
            <section>
              <Code lang='jsx' code={CustomCollectForm.srcContent} />
            </section>
          </section>
          <section>
            <h4>继承 FormControl 自定义表单元素</h4>
            <CustomFormControlForm />
            <section>
              <Code lang='jsx' code={CustomFormControlForm.srcContent} />
            </section>
          </section>
        </section>

        <section>
          <h4>继承 FormField</h4>
          <p>可以通过继承 FormField 并重写 renderLable, renderField, renderExplain 三个方法自定义 FormField</p>
          <section>
            <Code lang='jsx' code={InputField.srcContent} />
          </section>
        </section>
        <section>
          <h4>FormFooterField</h4>
          <Code lang='jsx' code={FormFooterField.srcContent} />
        </section>
        <section>
          <h4>禁用 FormField</h4>
          <FormFieldDisabledForm />
          <section>
            <Code lang='jsx' code={FormFieldDisabledForm.srcContent} />
          </section>
        </section>
      </section>
      <section>
        <Markdown>{`
# API
reat-form-state 依赖 [vajs](https://github.com/wenshin/vajs)，

## FormState
FormState 是一个纯 JS 类，负责处理表单状态变化。
FormState 实例化时会执行一次全量的校验，但是并不会把结果存储到 result 中。
这样可以实现表单首次没有错误显示。

### FormState.vajs
类属性

### FormState.isValid
实例属性，Boolean 类型，true 表示表单当前校验通过

### FormState.results
实例属性，Object，与 data 结构一致的校验结果集合

### FormState.constructor({isEdit, data, validator, nestFailMessage, onStateChange})
类构造函数

- **isEdit**，是否是编辑模式，如果是编辑模式，则第一次校验时会保留校验结果
- **data**，表单初始化数据
- **validator**，vajs.ValidatorMap 实例
- **nestFailMessage** 当执行嵌套校验时，用作嵌套校验结果的错误提示
- **onStateChange** 当执行 updateState 方法后触发该方法执行，参数为 FormState 实例

### FormState.prototype.updateState({name, value, validationResult, ignoreNestValidation})
更新数据和校验，并触发 onStateChange 方法

- **name**，表单初始化数据
- **value**，vajs.ValidatorMap 实例
- **validationResult**，存在嵌套校验结果需要同时判断
- **ignoreNestValidation**，如果为 true 则不会和嵌套的子校验结果联合校验，默认为 false

### FormState.prototype.update({name, value, validationResult, ignoreNestValidation})
只是更新数据和校验，适合用于联合更新数据，参数和 \`updateState\` 方法相同

### FormState.prototype.validateOne({name, value, validationResult, ignoreNestValidation})
校验指定数据，适合用于数据不更新只是校验，参数同 \`updateState\`。
如果 value 属性不存在于参数对象时，认为使用当前保存的值进行校验。

## DataSet
DataSet 实现了监听 onChange 事件冒泡的逻辑，调用 props.state.updateState 进行数据更新。
是用于实现 Form 和 FormControl 搜集数据功能的核心功能。

## Form
Form 组件是搜集整个表单的数据的根节点。props.state 必须是 FormState 实例。继承自 DataSet 类

## FormChild
FormChild 初始化了 Form 组件的 context 属性，
如果继承 FormChild 即可得到获取 Form 数据的方法。
FormControl，FormField，ExplainBase 等组件均是 FormChild 的子类。

### FormChild.form
实例属性，获取 Form 组件的 FormState 实例

### FormChild.formData
实例属性，获取 FormState 实例的 data 属性

### FormChild.formResults
实例属性，获取 FormState 实例的 results 属性

### FormChild.formValue
实例属性，获取 FormState 实例中 data[name] 值. name 为 formChild 的 props.name 值

### FormChild.formResult
实例属性，获取 FormState 实例中 results[name] 值. name 为 formChild 的 props.name 值

### FormChild.formNestResult
实例属性，获取 FormState 实例中 results[name].nest 值. name 为 formChild 的 props.name 值。
当 Form 和 FormControl 同时存在校验时，Form 校验的 result 结果会带上 FormControl 的结果。

## FormControl
FormControl 有两种模式，一种是搜集数据模式，一种是自定义表单控件模式。详细见 FormControl 的相关实例

## FormField、InputField
详细见实例

## ExplainBase、ExplainText 校验结果解释
详细见实例
        `}</Markdown>
      </section>
    </article>
  );
}


ReactDOM.render(<App />, window.document.getElementById('app'));
