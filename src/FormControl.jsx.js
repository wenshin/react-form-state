import _omit from 'lodash/omit';
import {PropTypes} from 'react';
import {fireEvent, isInputEventSupported} from './event';
import FormState from './FormState';

import DataSet from './DataSet.jsx';
import FormChild from './FormChild.jsx';

const {vajs} = FormState;

/**
 * 用法：
 *
 * ```
 * // 使用1：继承自定义 FormControl。便于封装 validators，达到非常好的可重用效果
 *
 * class CustomFormControl extends FormControl {
 *   _validator = vajs.map({key: vajs.require()});
 *   // 自动搜集数据
 *   _isCollectData = true;
 *
 *   handleChange = (e) => {
 *     this.triggerChange(e.target.value, e);
 *   };
 *
 *   renderFormControl() {
 *     return (
 *       <div><select></select><input onChange={this.handleChange}/></div>
 *     );
 *   }
 * }
 *
 * // 通过继承，封装 validator，并且可以重新定义 validator
 * <CustomFormControl name value validator />
 *
 * // 使用2：封装多个数据为对象格式。以下例子会获得 {test: {a1, a2}} 的数据结构
 * <FormControl name='test'>
 *   <input name='a1' value defaultValue />
 *   <input name='a2' value defaultValue />
 * </FormControl>
 *
 * ```
 */
export default class FormControl extends FormChild {
  static propTypes = {
    name: PropTypes.string,
    // 设置 defaultValue 表示把组件声明成 uncontrolled 组件
    // 注意，defaultValue 和 value 只使用其中一个
    defaultValue: PropTypes.any,
    // 设置 value 表示把组件声明成 controlled 组件
    value: PropTypes.any,
    required: PropTypes.bool,
    validator: PropTypes.shape({
      validate: PropTypes.func
    })
  };

  static defaultProps = {
    required: false,
    validator: null,
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
    this._dateSet = null;
    this._isCollectData = false;
  }

  get value() {
    return this.props.value || this.formValue;
  }

  get result() {
    if (this._isCollectData) {
      return this.dataSetState.results;
    } else if (!this.validator) {
      return this.formResult;
    }
    return this._result;
  }

  get validator() {
    const {required, validator} = this.props;
    let v =  validator || (
      this._validator instanceof Function
        ? this._validator()
        : this._validator
    );

    if (v) {
      if (!required && v.notRequire) {
        v.notRequire();
      } else if (required && v.require) {
        v.require();
      }
      return v;
    }

    if (!this._isCollectData && required) {
      v = vajs.require();
    }
    return v;
  }

  get dataSetState() {
    if (this._isCollectData && !this._dataSet) {
      this._dataSet = new FormState({
        data: this.value,
        validator: this.validator,
        onStateChange: this.onDataSetChange
      });
    }
    return this._dataSet;
  }

  /**
   * 子类继承时，需要使用 super.componentWillMount() 执行一次
   * 或者直接调用 this._
   */
  componentWillMount() {
    this._superComponentWillMountCalled = true;

    if (!this.validator) return;

    // FormControl 自定义的 validator 在首次渲染时需要和父组件联合校验一次
    if (!this._dataSet) {
      const {name} = this.props;
      const result = this.validator.validate(this.value);
      this.form.update({name, value: this.value, validationResult: result});
    } else {
      const result = this.validateWithDataSet();
      this.form.update({name, value: this.value, validationResult: result});
    }
  }

  validateWithDataSet() {
    let result;
    const {required} = this.props;
    if (this._dataSet.isEmpty && required) {
      result = vajs.require().validate();
    } else {
      result = new vajs.MapResult();
      result.results = this._dataSet.results;
    }
    return result;
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
    this.triggerChange(state);
  }

  /**
   * 自主触发
   * @param  {Any}          value        dataset 数据`{data, isValid, result}`或者其它数据
   * @param  {DomEventLike} srcEvent     原始对象
   * @return {undefined}
   */
  triggerChange = (value, srcEvent) => {
    srcEvent && srcEvent.stopPropagation && srcEvent.stopPropagation();

    const {_input} = this.refs;

    if (_input) {
      const eventType = isInputEventSupported() ? 'input' : 'change';

      _input.isFormControl = true;

      // 注意！不能用`_input.value = value`或者`_input.dataset.value = value`。
      // 赋值后值会变成`value.toString()`。
      if (this._isCollectData) {
        _input.formControlValue = value.data;
        _input.formControlResult = this.validateWithDataSet();
      } else {
        _input.formControlValue = value;
        if (this.validator) {
          _input.formControlResult = this.validator.validate(value);
        }
      }

      this._result = _input.formControlResult;

      // React 的 SyntheticEvent 是单例，如果执行流不中断会继续触发 srcEvent
      //
      // !!!!这里有个很大的坑
      // 如果组件中存在 input 输入中文需求时，不能使用 stateless 组件
      // 因为 FormControl 的自定义事件是在 setTimeout 后触发的，这个阶段重置 input 的 value 属性
      // 会破坏输入法的判断，导致重复输入的问题。
      // https://segmentfault.com/q/1010000003974633
      setTimeout(() => fireEvent(_input, eventType), 0);
    }
  };

  renderFormControl() {
    return null;
  }

  render() {
    if (!this._superComponentWillMountCalled) {
      throw new Error('继承 FormControl 并重写 componentWillMount 需要调用 super.componentWillMount()');
    }

    const {className, name, onChange, children} = this.props;
    let customChildren = this.renderFormControl();

    const inputAttrs = {name, ref: '_input', type: 'text'};

    const formControlAttrs = {
      className: 'form-control ' + (className || ''),
      onChange
    };

    if (!customChildren && children) {
      this._isCollectData = true;
      customChildren = children;
    }

    return (
      <div {...formControlAttrs}>
        <input hidden {...inputAttrs} />
        {this._isCollectData && customChildren
          ? <DataSet state={this.dataSetState}>{customChildren}</DataSet>
          : customChildren}
      </div>
    );
  }
}
