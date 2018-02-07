import React from 'react';
import FormControl from './FormControl.jsx';

const noop = () => {};

function createFormControl(ReactComponent, config) {
  if (!ReactComponent) throw new Error('React Class is needed');
  if (ReactComponent.FCtrlWrapper) return ReactComponent.FCtrlWrapper;
  const {validator, isCollectData, chagneHandlerProp = 'onChange'} = config || {};

  class FCtrlWrapper extends FormControl {
    _validator = validator;
    _isCollectData = isCollectData;

    renderFormControl() {
      const onChange = this.props[chagneHandlerProp];
      const overrideProps = {};
      overrideProps.value = this.value;
      overrideProps[chagneHandlerProp] = this.triggerChange;
      if (onChange) {
        overrideProps[chagneHandlerProp] = (...args) => {
          this.triggerChange(...args);
          onChange(...args);
        };
      } else {
        // 避免 React 提示受限组件必须有 onChange 的问题
        overrideProps[chagneHandlerProp] = noop;
      }
      return <ReactComponent {...this.props} {...overrideProps} />;
    }
  }

  ReactComponent.FCtrlWrapper = FCtrlWrapper;
  return FCtrlWrapper;
}

function createFormControlElement(ReactComponent, props, children) {
  const FCtrlWrapper = createFormControl(ReactComponent);
  return (
    <FCtrlWrapper {...props}>
      {children}
    </FCtrlWrapper>
  );
}

export default createFormControlElement;

export {createFormControl};
