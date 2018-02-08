import React from 'react';
import PropTypes from 'prop-types';
import FormState from './FormState';

import Form from './Form.jsx';
import FormChild from './FormChild.jsx';

export default class ControlCollector extends FormChild {
  static propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    validator: PropTypes.object,
  }

  static defaultProps = {
    className: '',
    validator: null,
  }

  constructor(props) {
    super(props);
    // the `name` property may set by `Field`, so do not set `isRequired` in `propTypes`
    if (!props.name) {
      throw new Error('name property is needed for ControlCollector');
    }

    this.collectorState = new FormState({
      data: this.formValue || {},
      validator: props.validator,
      onStateChange: this.onStateChange
    });
  }

  componentWillMount() {
    this.form.update({
      name: this.props.name,
      value: this.collectorState,
      notUpdateResult: true,
    });
  }

  onStateChange = (state) => {
    this.form.updateState({
      name: this.props.name,
      value: state
    });
  }

  render() {
    const {className} = this.props;

    const cls = 'form-control-collector ' + (className || '');

    return (
      <Form
        {...this.props}
        className={cls}
        state={this.collectorState}
      />
    );
  }
}
