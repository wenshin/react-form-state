## react-form-state

A powerful react form support union validation and nest validation.
Not Spport React Native.

## Features

1. ui and data separation
2. custom form control
3. collect data into object
4. union validation
5. collect data with onChange bubble
6. support IE9+


## docs

    npm i
    npm run docs-server

## Releases

**3.1.1**
> 修复问题

**3.1.0**
> 修复 Control 子元素使用 onChange 报错的问题
> ExplainText 优化

**3.0.0**
> 把 FormControl 才分为Control 和 ControlCollector 让使用更加清晰，理解更加简单
> Control 组件可以减少组件继承二次封装的需要

**2.0.0**
> value 和 result 分离开。修改 FormState.data 的值和 vajs 自定义校验的入参`vajs.v((value, {state, subResult}) => {})`

**1.2.1**
> 修复 React Not defined 问题

**1.2.0**
> 添加 FormControl 工厂函数
> 兼容 React 15.x, 16.x


**1.1.2**
> support ie9+ http://babeljs.io/docs/usage/caveats/

**1.1.1**
> refactor Form and FormControl

**1.1.0**
> upgrade vajs
> Add updateValidator api

**1.0.0**
> this is a break change version

- refactor the FormControl and event listener
- remove Util.mergeNestedResult and Util.getNestedResult
- remove DataSet
- update vajs to 1.0.5 which fix some bugs
- fix async validation error

**0.2.3**

- upgrade vajs to 1.0.4, remove Proxy dependency

**0.2.2**

- upgrade vajs to 1.0.3


**0.2.1**

- fix merge nested result bug

**0.2.0**
version 0.2.0 remove the nesting validation of FormControl and FormState. you need do nesting validation by your self with Util.mergeNestedResult()
> this version is not a backward compatible upgrade.

- remove nesting validation by default

**0.1.1**
- fix FormField bug

**0.1.0**
> this version is not a backward compatible upgrade.

- change FormState.updateState, FormState.update, FormState.validateOne api
- change vajs reference to FormState.vajs
- fix some bugs
- better docs
- add some better feature

**0.0.3**

- add vajs reference to FormState.va

**0.0.2**

- Fix React 0.14.x compatible bug

**0.0.1**

- first release
