## react-form-state

A powerful react form support union validation and nest validation.

## Features

1. ui and data separation
2. custom form control
3. collect data into object
4. union validation
5. collect data with onChange bubble


## docs

    npm i
    npm run docs-server

## Releases

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
