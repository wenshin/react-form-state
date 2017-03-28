import {Component, PropTypes} from 'react';

export default class NestedField extends Component {
  static propTypes = {
    show: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.any
  };

  static defaultProps = {
    show: false,
    className: ''
  };

  render() {
    const {show, className, children} = this.props;

    if (show) {
      return (
        <div className={`nested-field ${className}`}>
          <i className='type-more-tri'></i>
          {children}
        </div>
      );
    }

    return null;
  }
}
