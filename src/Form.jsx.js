import {Component, PropTypes} from 'react';
import FormState from './FormState';

const tagsHaveInputEvent = ['input', 'select', 'textarea'];
const inputTypesUsingClickEvent = ['checkbox', 'radio'];

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

  onInput = (e) => {
    // contenteditable element will not trigger onChange event
    if (e.target.contentEditable === 'true') {
      this.onChange(e);
    }
  }

  render() {
    const {children, className} = this.props;
    return (
      <div
        onChange={this.onChange}
        onInput={this.onInput}
        className={`form-state ${className || ''}`}
      >
        {children}
      </div>
    );
  }
}


function getEventData(e) {
  const {
    type, checked,
    isFormControl, formControlValue,
    contentEditable
  } = e.target;
  let {name, value} = e.target;

  name = name || e.target.getAttribute('name');
  value = type === 'checkbox' ? checked : value;
  value = isFormControl ? formControlValue : value;

  if (contentEditable === 'true') {
    value = e.target.innerHTML;
  }
  return {name, value};
}
