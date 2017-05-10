import {Component, PropTypes} from 'react';
import FormState from './FormState';

export default class DataSet extends Component {
  static propTypes = {
    state: PropTypes.instanceOf(FormState).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired
  }

  onChange = (e) => {
    const data = getEventData(e);
    // 只有当存在 name 字段时才捕捉
    if (data.name) {
      // 经过节流后，SyntheticEvent 对象会重置，不能执行 e.stopPropagation。
      e.stopPropagation();
      this.props.state.updateState({
        name: data.name,
        value: data.value,
        validationResult: data.formControlResult
      });
    }
  }

  renderChildren() {
    return this.props.children;
  }

  render() {
    const children = this.renderChildren();
    return (
      <div
        onChange={this.onChange}
        className='data-set'
      >
        {children}
      </div>
    );
  }
}


function getEventData(e) {
  const {
    name, type, checked,
    isFormControl, formControlValue, formControlResult
  } = e.target;
  let {value} = e.target;

  value = type === 'checkbox' ? checked : value;
  value = isFormControl ? formControlValue : value;
  return {
    name,
    value,
    formControlResult
  };
}
