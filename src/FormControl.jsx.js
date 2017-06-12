import _omit from 'lodash/omit';
import {PropTypes} from 'react';
import {fireEvent, isInputEventSupported} from './event';
import FormState from './FormState';

import DataSet from './DataSet.jsx';
import FormChild from './FormChild.jsx';

const {vajs} = FormState;

export default class FormControl extends FormChild {
  static propTypes = {
    name: PropTypes.string,
    // 设置 defaultValue 表示把组件声明成 uncontrolled 组件
    // 注意，defaultValue 和 value 只使用其中一个
    defaultValue: PropTypes.any,
    // 设置 value 表示把组件声明成 controlled 组件
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  static defaultProps = {
    onChange: null,
    defaultValue: null
  }

  /**
   * 扩展 FormControl 的静态对象属性，比如 propTypes, defaultProps
   * @param  {String} propertyName 要扩展的属性名
   * @param  {Object} update       更新的值
   * @return {Object}              新的属性值
   */
  static extendsStatic(propertyName, update) {
    return Object.assign({}, FormControl[propertyName] || {}, update);
  }

  constructor(props) {
    super(props);
    this._dataSetState = null;
    this._isCollectData = false;
    this._validator = null;
    this._initialized = false;
  }

  initState() {
    if (this._initialized) return;

    let value;
    const {name} = this.props;
    if (this._isCollectData) {
      this._dataSetState = new FormState({
        data: this.value,
        validator: this.validator,
        onStateChange: this.onDataSetChange
      });
      this.form.data[name] = this._dataSetState;
      value = this._dataSetState;
    } else if (this.validator) {
      value = this.validator.validate(this.value);
    }

    if (value) {
      this.form.data[name] = value;
      if (value.isValid) {
        this.form._invalidSet.delete(name);
      } else {
        this.form._invalidSet.add(name);
      }
    }

    this._initialized = true;
  }

  get value() {
    return this.props.value || this.formValue;
  }

  get validator() {
    return this._validator || this.props.validator;
  }

  pickProps() {
    const {defaultValue} = this.props;
    // React 要求 value 和 defaultValue 只能有一个。。。
    if (defaultValue) {
      return _omit(this.props, ['validator']);
    } else {
      return _omit(this.props, ['validator', 'defaultValue']);
    }
  }

  // 继承时可覆盖，设置联合校验等逻辑
  onDataSetChange = (state) => {
    console.log('trigger change')
    this.triggerChange(state);
  }

  /**
   * 自主触发
   * @param  {Any}          value        dataset 数据`{data, isValid, result}`或者其它数据
   * @param  {DomEventLike} srcEvent     原始对象
   * @return {undefined}
   */
  triggerChange = (value, srcEvent) => {
    console.log('form control src event', srcEvent)
    srcEvent && srcEvent.stopPropagation && srcEvent.stopPropagation();

    const {_input} = this.refs;

    if (_input) {
      const eventType = isInputEventSupported ? 'input' : 'change';

      _input.isFormControl = true;

      // 注意！不能用`_input.value = value`或者`_input.dataset.value = value`。
      // 赋值后值会变成`value.toString()`。
      _input.formControlValue = value;

      if (this._isCollectData) {
        this._result = value.results;
      }

      console.log('fire event')
      fireEvent(_input, eventType);
      // React 0.14.x 的 SyntheticEvent 是单例，如果执行流不中断会继续触发 srcEvent
      //
      // !!!!这里有个很大的坑
      // 如果组件中存在 input 输入中文需求时，不能使用 stateless 组件
      // 因为 FormControl 的自定义事件是在 setTimeout 后触发的，这个阶段重置 input 的 value 属性
      // 会破坏输入法的判断，导致重复输入的问题。
      // https://segmentfault.com/q/1010000003974633
      // setTimeout(() => fireEvent(_input, eventType), 0);
    }
  };

  renderFormControl() {
    return null;
  }

  render() {
    const {className, name, children} = this.props;
    const inputAttrs = {name, ref: '_input', type: 'text'};
    let customChildren = this.renderFormControl();

    if (!customChildren && children) {
      this._isCollectData = true;
      customChildren = children;
    }

    // 依赖 this._isCollectData 所以不能放在最前面
    this.initState();

    const formControlAttrs = {
      className: 'form-control ' + (className || '')
    };

    return (
      <div {...formControlAttrs}>
        <input hidden {...inputAttrs} />
        {this._isCollectData && customChildren
          ? <DataSet name={name} state={this._dataSetState}>{customChildren}</DataSet>
          : customChildren}
      </div>
    );
  }
}
