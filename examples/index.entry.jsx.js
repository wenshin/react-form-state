import React from 'react';
import ReactDOM from 'react-dom';
import {InputField} from 'react-form-state';
import Markdown, {Code} from './Markdown.jsx';
import UnionUpdateForm from './normal/UnionUpdateForm.jsx';
import AsyncValidationForm from './normal/AsyncValidationForm.jsx';
import CollectForm from './form-control/CollectForm.jsx';
import CollectForm2 from './form-control/CollectForm2.jsx';
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
该React 组件只适合于 Web 平台，但是 FormState 却可以用于任何 JS 运行环境。

# 设计哲学
### UI 和 Form 数据处理逻辑分离
当表单存在复杂的校验，各个元素之间存在复杂的联合更新和联合校验时，
如果把所有逻辑都写在 UI 组件里，往往会让 UI 组件变得复杂且难以维护，
这时我们可能希望数据逻辑可以单独抽离出来处理。
另外一个场景，在不同的项目（使用不一样的 UI 解决方案）之间需要进行共享重复表单实现时，
这往往发生在内网和外网同时提供服务，PC 端和移动端同时提供服务，
我们期望表单的数据处理逻辑可以直接被复用。

### 1.0 核心逻辑简优化

从 1.0.0 开始，恢复 FormControl 支持 validator 自校验，
但是和以前 0.1.x 和 0.2.3 版本不同，不再需要处理令人厌烦的嵌套校验结果了，
FormControl 上报的结果就是校验结果。因此也就去掉 Util.mergeNestedResult 和 Util.getNestedResult 方法。
虽然这一切都很美好，也引入了一点小小的问题，在初始化 FormState 并设置 data 属性时，
你需要设置属性值为 \`{value: null}\` 或者 \`{data: {}}\`

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
FormControl 默认接受的属性有 \`name\`, \`value\`, \`defaultValue\`, \`validator\`。

FormControl 有三种模式：
1. **收集模式**，可以直接嵌套为 FormControl 的子元素，也可以通过集成实现。
2. **控件模式**，通过继承并在内部调用 \`this.triggerChange()\` 封装为一个可触发 onChange 事件的控件元素。
3. **收集控件模式**，通过继承并且设置 _isCollectData 为 true，可把数据收集为一个对象。

#### 三种校验设置方法
1. **Form 校验**。在 Form 的 FormState 实例化时设置；
2. **FormControl 自带校验**。继承 FormControl 时设置 _validator 属性；
3. **FormControl 传入校验**。给 FormControl 传入 validator 属性；

当 FormControl 自带校验或者传入校验都存在时，会判断是否是**收集模式**。
如果是，则会合并两个校验；如果不是则优先使用传入的校验。

当 FormControl 自带校验或者传入校验，FormControl 上报 Form 的数据格式会不是存粹的数据。
如果是**收集模式**，则上报有一个 FromState 的实例，
如果是**控件模式**，则上传 vajs.Result 或者 vajs.MapResult 实例。
因此在给 FormState 设置初始值时，
你需要传入值是 \`{value: null}\` 或者 \`{data: {}}\` 的格式。
        `}</Markdown>
          <section>
            <h4>FormControl 收集模式，在顶层 Form 实现校验</h4>
            <CollectForm />
            <section>
              <Code lang='jsx' code={CollectForm.srcContent} />
            </section>
          </section>
          <section>
            <h4>FormControl 收集模式，自带校验功能结果</h4>
            <Markdown>{`

            `}</Markdown>
            <CollectForm2 />
            <section>
              <Code lang='jsx' code={CollectForm2.srcContent} />
            </section>
          </section>
          <section>
            <h4>FormControl 模式，继承 FormControl 封装采集数据</h4>
            <CustomCollectForm />
            <section>
              <Code lang='jsx' code={CustomCollectForm.srcContent} />
            </section>
          </section>
          <section>
            <h4>FormControl 控件模式，继承 FormControl 自定义表单元素</h4>
            <CustomFormControlForm />
            <section>
              <Code lang='jsx' code={CustomFormControlForm.srcContent} />
            </section>
          </section>
        </section>

        <section>
          <h4>继承 FormField</h4>
          <p>可以通过继承 FormField 并重写 renderLabel, renderField, renderExplain 三个方法自定义 FormField</p>
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
reat-form-state 依赖 [vajs@^1.0.2](https://github.com/wenshin/vajs)，
推荐通过 FormState.vajs 获取而不是直接依赖。

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

### FormState.constructor({isEdit, data, validator, onStateChange})
类构造函数

- **isEdit**，是否是编辑模式，如果是编辑模式，则第一次校验时会保留校验结果
- **data**，表单初始化数据
- **validator**，vajs.ValidatorMap 实例
- **onStateChange** 当执行 updateState 方法后触发该方法执行，参数为 FormState 实例

### FormState.prototype.updateState({name, value})
更新数据和校验，并触发 onStateChange 方法

- **name**，表单初始化数据
- **value**，vajs.ValidatorMap 实例

### FormState.prototype.update({name, value})
只是更新数据和校验，适合用于联合更新数据，参数和 \`updateState\` 方法相同

### FormState.prototype.validateOne({name, value})
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

### FormChild.formNestedResult
实例属性，获取 FormState 实例中 results[name].nest 值. name 为 formChild 的 props.name 值。
当 Form 和 FormControl 同时存在校验时，Form 校验的 result 结果会带上 FormControl 的结果。


## FormControl
FormControl 有两种模式，一种是搜集数据模式，一种是自定义表单控件模式。详细见 FormControl 的相关实例
从 0.2.0 开始， FormControl 组件不再支持 validator, required 属性


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
