import FormControl from './FormControl.jsx';

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
      overrideProps[chagneHandlerProp] = this.triggerChange;
      if (onChange) {
        overrideProps[chagneHandlerProp] = (...args) => {
          this.triggerChange(...args);
          onChange(...args);
        };
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
