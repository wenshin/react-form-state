import {PropTypes} from 'react';
import Explain from './Explain';
import DataSet from './DataSet.jsx';

export default class Form extends DataSet {
  static childContextTypes = {
    form: PropTypes.object
  };

  getChildContext() {
    return {form: this.props.state};
  }

  renderChildren() {
    const {className, children} = this.props;
    return (
      <div className={`form-state ${className || ''}`}>
        {children}
      </div>
    );
  }
}
