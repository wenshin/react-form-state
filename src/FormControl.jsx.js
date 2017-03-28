import {PropTypes} from 'react';
import {fireEvent, isInputEventSupported} from './event';

import DataSet from './DataSet.jsx';
import FormChildComponent from './FormChildComponent.jsx';

/**
 * 可以合并子元素的输入为单个输入并向上冒泡 change 事件。
 * 比如，如果`props.isCollectData`为 true，
 * 且有`<input name='a'/>` 和 `<input name='b'/>` 两个输入，
 * FormControl 会自动拦截两个 change 事件，把数据合并成`{a: '', b: ''}` ，并新触发一个 change 事件。
 *
 * 详细用法：
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
 * <CustomFormControl name value defaultValue validator />
 *
 * // 覆盖自定义的 validator
 * <CustomFormControl name value defaultValue validator />
 *
 * // 使用2：封装多个数据为对象格式。以下例子会获得 {test: {a1, a2}} 的数据结构
 * <FormControl name='test'>
 *   <input name='a1' value defaultValue />
 *   <Explain explain={{type: 'err', message: 'foo'}} defaultExplain={} inline />
 *   <input name='a2' value defaultValue />
 *   <Explain explain={{type: 'err', message: 'foo'}} defaultExplain={} inline />
 * </FormControl>
 *
 * ```
 */
export default class FormControl extends FormChildComponent {
  static propTypes = {
    name: PropTypes.string,
    defaultValue: PropTypes.any,
    explain: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    }),
    defaultExplain: PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    }),
    value: PropTypes.any,
    validator: PropTypes.shape({
      validate: PropTypes.func,
    })
  };

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
    this._isCollectData = false;
  }

  get value() {
    const val = this.props.value;
    if (canUseDefault(val)) {
      if (canUseDefault(this.formValue)) {
        return this._isCollectData ? {} : val;
      }
      return this.formValue;
    }
    return val;
  }

  get defaultValue() {
    const val = this.props.defaultValue;
    if (canUseDefault(val)) {
      if (canUseDefault(this.formDefaultValue)) {
        return this._isCollectData ? {} : val;
      }
      return this.formDefaultValue;
    }
    return val;
  }

  get isValid() {
    return !!Object.keys(this.explain || {});
  }

  get explain() {
    return this.props.explain
      || this.formExplain
      || (this._isCollectData ? {} : this.props.explain);
  }

  get nestExplain() {
    const explain = this.explain || {};
    return explain.nestExplain || {};
  }

  get defaultExplain() {
    return this.props.defaultExplain
      || this.formDefaultExplain
      || (this._isCollectData ? {} : this.props.defaultExplain);
  }

  get validator() {
    return this.props.validator
      || (
        this._validator instanceof Function
          ? this._validator()
          : this._validator
      );
  }

  getCollectedDataByName(name) {
    if (this._isCollectData) {
      return {
        value: this.formValue && this.formValue[name],
        explain: this.formExplain && this.formExplain[name]
      };
    }
    throw new Error('can not getCollectedDataByName use when FormControl is not collect data mode');
  }

  /**
   * 自主触发
   * @param  {Any}          value        dataset 数据`{data, transformed, isValid, explains}`或者其它数据
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
      } else {
        _input.formControlValue = value;
      }

      if (this._isCollectData) {
        _input.formControlData = value;
      } else if (this.validator) {
        _input.formControlData = this.validator.validate(value);
      }

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
    const {className, name, onChange, children} = this.props;
    let customChildren = this.renderFormControl();

    const inputAttrs = {name, ref: '_input', type: 'text'};

    const formControlAttrs = {
      className: 'form-control ' + (className || ''),
      onChange
    };

    const dataSetAttrs = {
      ref: 'dataSet',
      data: this.value,
      defaultData: this.defaultValue,
      explain: this.explain,
      onDataChange: data => this.triggerChange(data),
      // 如果FormControl 的 validator 不是 Map 对象，那么不设置 DataSet 的验证
      validator: this.validator && this.validator.has ? this.validator : undefined
    };

    if (!customChildren && children) {
      this._isCollectData = true;
      customChildren = children;
    }

    return (
      <div {...formControlAttrs}>
        <input hidden {...inputAttrs} />
        {this._isCollectData && customChildren
          ? <DataSet {...dataSetAttrs}>{customChildren}</DataSet>
          : customChildren}
      </div>
    );
  }
}


function canUseDefault(value) {
  return typeof value === 'undefined' || value === null;
}
