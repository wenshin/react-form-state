import {Component, PropTypes} from 'react';
import FormState from './FormState';
import {isInputEventSupported} from './event';

export default class Form extends Component {
  static propTypes = {
    className: PropTypes.string,
    state: PropTypes.instanceOf(FormState).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired
  };

  static defaultProps = {
    className: ''
  };

  static childContextTypes = {
    form: PropTypes.object
  };

  getChildContext() {
    return {form: this.props.state};
  }

  onChange = (e) => {
    const data = getEventData(e);
    // 只有当存在 name 字段时才捕捉
    if (data.name) {
      // 不用在意，目前已经不适用 React 的事件流
      // 但是保留在这里作为知识。
      // React 经过节流后，SyntheticEvent 对象会重置，不能执行 e.stopPropagation。
      e.stopPropagation();
      this.props.state.updateState({
        name: data.name,
        value: data.value,
      });
    }
  }

  // 直接使用 React 的 onChange 监听会导致重复监听，这里还是获取原生 DOM 来监听事件
  handleRef = (el) => {
    let event = 'input';
    if (!isInputEventSupported) {
      event = 'change';
    }
    el.addEventListener(event, this.onChange);
  }

  render() {
    const {children, className} = this.props;
    return (
      <div
        ref={this.handleRef}
        className={`form-state ${className || ''}`}
      >
        {children}
      </div>
    );
  }
}


function getEventData(e) {
  const {
    name, type, checked,
    isFormControl, formControlValue
  } = e.target;
  let {value} = e.target;

  value = type === 'checkbox' ? checked : value;
  value = isFormControl ? formControlValue : value;
  return {name, value};
}
