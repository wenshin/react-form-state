import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {InputField} from 'react-form-state';
import Markdown, {Code} from './Markdown.jsx';
import UnionUpdateForm from './normal/UnionUpdateForm.jsx';
import AsyncValidationForm from './normal/AsyncValidationForm.jsx';
import CustomControl from './form-control/CustomControl.jsx';
import CollectForm from './form-control/CollectForm.jsx';
import ControlUseWithoutForm from './form-control/ControlUseWithoutForm.jsx';
import FormFieldDisabledForm from './form-field/FormFieldDisabledForm.jsx';
import FormFooterField from './FormFooterField.jsx';

import formIntroImg from './imgs/form-intro.jpg';

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

### 样式最简
现实中，很多业务没有办法直接使用固定的样式，如果组件提供复杂的样式实现，将很大概率导致样式冲突。

### 事件冒泡
使用 onChange 事件冒泡自动搜集数据，去掉 React 在复杂表单中频繁的事件绑定，以及双向绑定中的额外函数绑定。

### 不支持的特性
目前不支持自动收集 contentEditable 的元素，因为在自动刷新 contentEditable 元素时会丢失 Cursor 的焦点。
因此你需要在 contentEditable 元素编辑完后再去获取编辑好的内容，可参考下面第一个例子。

# 3.0 主要变化
3.0 开始对 react-form-state 作了大量重构，简化了学习文档，把 FormControl 改为 Control 避免冗余。
整体上继续精简各种功能，使得核心功能更加简洁优雅。
以前版本中 FormControl 的采集功能独立出来变成 ControlCollector。
2.0 中加入的工厂函数也在 Control 独立实现，不在需要在 JSX 中引入函数了

# 概念介绍
![表单各元素介绍](${formIntroImg})
1. filed 包含 label、contorl、explain 三个子元素
2. label 是用于描述 control 的名称，比如：用户名，密码
3. control 是指在表单中产生数据的元素，比如：input, textarea, select 等。
4. explain 是指 control 的说明文案或者校验提示结果

# 使用指南
## 引入文件
同时引入 js 和 css。

- \`import Form from '@myfe/react-form-state'\`
- \`<link rel="stylesheet" href="path/to/@myfe/react-form-state/style.css"></link>\`
- \`import Form from '@myfe/react-form-state/webpack' 当你使用 webpakc，会自动引入 style.css\`
        `}</Markdown>
      </section>

      <section>
        <h2>例子</h2>
        <section>
          <h3>1 联合更新和校验</h3>
          <section>
            <Code lang='jsx' code={UnionUpdateForm.srcContent} />
          </section>
          <UnionUpdateForm />
        </section>

        <section>
          <h3>2 服务器端校验</h3>
          <section>
            <Code lang='jsx' code={AsyncValidationForm.srcContent} />
          </section>
          <AsyncValidationForm />
        </section>

        <section>
          <Markdown>{`
### 3 自定义 Control 组件
通过 Control 和 ControlCollector 我们可以实现非常灵活的组件自定义。
Control 和 ControlCollector 都接受的属性有 \`name\`, \`value\`, \`validator\`。
如果是在 Form 组件内部使用，name 是必须的属性。如果是嵌套在 Field 内，那么 name 可以省略。
本节我们先介绍 Control 的使用和自定义


Control 有两种使用方式：
1. **继承方式**，通过继承并在内部调用 \`this.triggerChange()\` 封装为一个控件元素。
2. **嵌套方式**，通过 Control 的 children 传入已有的控件组件。

第二种方式，在我们的第一个例子中已经有比较详细的介绍，以下的例子主要以继承方式为主。

三种校验设置方法
1. **Form 校验**。在 Form 的 FormState 实例化时设置；
2. **Control 自带校验**。继承 Control 时设置 _validator 属性；
3. **Control 传入校验**。给 Control 传入 validator 属性；

当 Control 自带校验或者传入校验都存在时，会判断两个 validator 是否都是 ValidatorMap 实例，如果是将进行合并。
        `}</Markdown>
          <section>
            <h4>3.1 自定义 Control 组件</h4>
            <Code lang='jsx' code={CustomControl.srcContent} />
            <CustomControl />
          </section>
          <section>
            <h4>3.2 不在 Form 中使用 Control</h4>
            <section>
              <Code lang='jsx' code={ControlUseWithoutForm.srcContent} />
            </section>
            <ControlUseWithoutForm />
          </section>
        </section>

        <section>
          <Markdown>{`
### 4. ControlCollector 组件
ControlCollector 其实就是 Form 的二次封装，可以实现搜集子元素到一个对象中的功能
        `}</Markdown>
          <section>
            <Code lang='jsx' code={CollectForm.srcContent} />
          </section>
          <CollectForm />
        </section>

        <section>
          <h2>其它功能</h2>
          <section>
            <h4>1 继承 FormField</h4>
            <section>
              <Code lang='jsx' code={InputField.srcContent} />
            </section>
            <p>可以通过继承 FormField 并重写 renderLabel, renderField, renderExplain 三个方法自定义 FormField</p>
          </section>

          <section>
            <h4>2 禁用 FormField</h4>
            <section>
              <Code lang='jsx' code={FormFieldDisabledForm.srcContent} />
            </section>
            <FormFieldDisabledForm />
          </section>

          <section>
            <h4>3 FormFooterField</h4>
            <Code lang='jsx' code={FormFooterField.srcContent} />
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


### FormState.prototype.updateState({name, value, notUpdateResult})
更新数据和校验，并触发 onStateChange 方法

- **name**，表单初始化数据
- **value**，vajs.ValidatorMap 实例
- **notUpdateResult**，Boolean，true 代表只更新 formState.isValid 不更新 formState.results

### FormState.prototype.update({name, value, notUpdateResult})
只是更新数据和校验，适合用于联合更新数据，参数和 \`updateState\` 方法相同

### FormState.prototype.validateOne({name, value, notUpdateResult})
校验指定数据，适合用于数据不更新只是校验，参数同 \`updateState\`。
如果 value 属性不存在于参数对象时，认为使用当前保存的值进行校验。


## Form
Form 组件是搜集整个表单的数据的根节点。props.state 必须是 FormState 实例。

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

## Control 组件
继承于 FormChild。Control 是表单元素控件，支持通过继承、嵌套两种方式获取数据并更新到 form 中。

组件属性有：
  1. name: PropTypes.string,
  2. onChange: PropTypes.func,
  3. validator: PropTypes.object,
  4. value: PropTypes.any,  Control 只支持受限组件
  5. children: PropTypes.element,
  6. valueKey: PropTypes.string, 子组件更新数据的属性名，默认是 'value'。例如 checkbox 元素是通过 'checked' 来更新组件数据
  7. formatValue: PropTypes.func, 子组件数据重新格式化的方法
  8. onChangeKey: PropTypes.string, 子组件数据变更事件的回调函数名，默认是 'onChange'

## ControlCollector
继承于 FormChild，封装了子表单。组件属性有：name，validator，className。都是可选值，但是如果不和 Field 一起使用，必须传入 name 属性。

## Field、InputField
详细见实例

## ExplainBase、ExplainText 校验结果解释
详细见实例
        `}</Markdown>
      </section>
    </article>
  );
}


ReactDOM.render(<App />, window.document.getElementById('app'));
