import vajs from 'vajs';
import _pick from 'lodash/pick';
import _isEmpty from 'lodash/isEmpty';
import _mapValues from 'lodash/mapValues';
import {Component, PropTypes} from 'react';
import Explain from './Explain.jsx';

/**
 * 数据收集组件
 * 该组件通过监听子组件的 onChange 事件，收集子组件的 name、value 等属性
 * 或者 formControlValue、formControlDebounce 等信息，而形成一个新的数据对象。
 * 生成新数据之前，支持通过传递 vajs.map() 实例对象进行验证，验证的结果会通过设置
 * onDataChange 函数并从参数中获取，也可以通过 DataSet.getDataSetState 获取。
 *
 * 联合校验和实现方法。
 * 一般联合校验有以下几种场景
 * 1. b 变更，校验 a 的 validator，并在 a 的对应位置展示错误信息
 * 2. b 变更，检验 b 的 validator 时需要用到 a 的值，并在 b 的对应位置展示错误信息
 * 3. b 变更，校验 a, b 的 validator, 并在 a, b 的对应位置展示错误信息
 *
 * 第一种实现方法
 * ```
 * const validator = vajs.map({
 *   a: vajs.v((value, formState) => {
 *     return true;
 *   })
 * });
 *
 * <DataSet ref='dataset' onDataChange={(formState) => {
 *   const {nameChange, data} = formState;
 *   if (nameChanged === 'b') {
 *     this.refs.dataset.handelDataChange({name: a, value: data.a});
 *     return;
 *   }
 *   this.setState(formState);
 * }} />
 * ```
 *
 * 第二种实现方法
 * ```
 * const validator = vajs.map({
 *   b: vajs.v((value, formState) => {
 *     return formState.a;
 *   })
 * });
 * <DataSet ref='dataset' onDataChange={(formState) => {
 *   const {nameChange, data} = formState;
 *   if (nameChanged === 'b') {
 *     this.refs.dataset.handelDataChange({name: a, value: data.a});
 *     return;
 *   }
 *   this.setState(formState);
 * }} />
 * ```
 *
 * 第三种实现方法
 * ```
 * const validator = vajs.map({
 *   b: vajs.v((value, formState) => {
 *     return formState.a;
 *   }),
 *   a: vajs.v((value, formState) => {
 *     return formState.b;
 *   })
 * });
 * <DataSet ref='dataset' onDataChange={(formState) => {
 *   const {nameChange, data, isJointChange} = formState;
 *   if (nameChanged === 'b' && !isJointChange) {
 *     this.refs.dataset.handleDataChange({name: a, value: data.a, isJointChange: true});
 *     return;
 *   }
 *   if (nameChanged === 'a' && !isJointChange) {
 *     this.refs.dataset.handleDataChange({name: b, value: data.b, isJointChange: true});
 *     return;
 *   }
 *   this.setState(formState);
 * }} />
 * ```

 */
export default class DataSet extends Component {
  static propTypes = {
    data: PropTypes.object,
    defaultData: PropTypes.object,
    /**
     * 初始化时的数据解释，explains 的属性值是 DataSet 监听对象的 name 属性值
     */
    explains: PropTypes.object,
    defaultExplains: PropTypes.object,
    // 更新 DataSet 的 nameChanged 值
    nameChanged: PropTypes.string,
    /**
     * onDataChange 参数，当 DataSet 的数据发生变化时调用
     * 定义 onDataChange({explains, data, isValid, nameChanged})
     */
    onDataChange: PropTypes.func,
    validator: PropTypes.instanceOf(vajs.ValidatorMap),
    children: PropTypes.any.isRequired
  };

  static defaultProps = {
    data: {},
    defaultData: {},
    explains: {},
    editMode: false,
    defaultExplains: {}
  };

  static DEFAULT_VALIDATE_ERROR = 'Validate Fail!';

  /**
   * 初始化的时候，只有数据中存在的字段才提示错误，否则提示默认的错误
   */
  static messageToExplainByValue(value, message) {
    if (typeof message === 'object') {
      return value
        ? _mapValues(value, (v, key) => Explain.fail(message[key]))
        : {};
    }
    return Explain.fail(message);
  }

  /**
   * 当变更过程中，则会提示所有的错误
   */
  static messageToExplain(message) {
    if (typeof message === 'object') {
      return _mapValues(message, msg => Explain.fail(msg));
    }
    return Explain.fail(message);
  }

  constructor(props) {
    super(props);
    this._dataSetState = {
      isValid: true,
      explains: {},
      nameChanged: '',
      nameSetValidateFailed: new Set(),
    };

    // 初始化 Form 表单的校验状态
    this.initState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.initState(nextProps);
  }

  initState(props) {
    const {data, explains, validator} = props;

    // 初始化 Form 表单的校验状态，当首次渲染将会做一次完整校验
    if (!_isEmpty(data) && validator && !this._dataSetState.nameChanged) {
      this._dataSetState = this.validateAll(props);
    } else {
      !_isEmpty(data) && (this._dataSetState.data = this.getData(props));
      !_isEmpty(explains) && (this._dataSetState.explains = this.getExplains(props));
    }

    // props 中有 nameChanged 属性时，会覆盖 this._dataSetState.nameChanged
    // 这个功能在当表单保存后，通过把 nameChanged 设为 '', null 值。
    // 这样就可以用 nameChanged 来判断表单是否已经保存
    'nameChanged' in props && (this._dataSetState.nameChanged = props.nameChanged);
  }

  getData(props) {
    return Object.assign({}, props.defaultData, props.data);
  }

  getExplains(props) {
    return Object.assign({}, props.defaultExplains, props.explains);
  }

  getEventData(e) {
    let {
      name, type, value, checked,
      isFormControl, formControlValue, formControlData
    } = e.target;

    value = type === 'checkbox' ? checked : value;
    value = isFormControl ? formControlValue : value;
    return {
      name,
      value,
      formControlData
    };
  }

  get data() {
    return this._dataSetState.data || {};
  }

  get defaultData() {
    return this.props.defaultData || {};
  }

  get explains() {
    return this._dataSetState.explains || {};
  }

  get defaultExplains() {
    return this.props.defaultExplains || {};
  }

  get validator() {
    return this.props.validator;
  }

  get isValid() {
    return !this._dataSetState.nameSetValidateFailed.size;
  }

  isValidByName(name) {
    return !this._dataSetState.nameSetValidateFailed.has(name);
  }

  onChange = e => {
    // 如果没有传递 this.props.onDataChange 则不进行任何操作
    if (!this.props.onDataChange) return;

    const data = this.getEventData(e);
    // 只有当存在 name 字段时才捕捉
    if (data.name) {
      // 经过节流后，SyntheticEvent 对象会重置，不能执行 e.stopPropagation。
      e.stopPropagation();
      this.handleDataChange(data);
    }
  };

  /**
   * 当需要在 Form 组件使用的过程中，手动修改某个数据的值并重用数据校验
   * 可以在 Form 使用的上层组件中使用 this.refs.form.handleDataChange({name, value, isJointChange: true})
   * @param  {[type]} options.name            修改的字段名
   * @param  {[type]} options.value           修改的字段值
   * @param  {[type]} options.formControlData Form 中的 FormControl 数据，可能是一个 Result 或者一个 DataSetState
   * @param  {[type]} options.isJointChange   true 是联合变更，
   * 联合校验，必须在业务逻辑中调用 `this.refs.form.handleDataChange({name, value, isJointChange: true})`，
   * 比如 UI 触发了 a 字段变更，但是我们想同时校验 b 字段并对其进行校验。
   */
  handleDataChange = ({name, value, formControlData, isJointChange}) => {
    this._dataSetState = this.createState({name, value, formControlData});
    const {onDataChange} = this.props;
    this._dataSetState.isJointChange = isJointChange;
    onDataChange({isJointChange, ...this._dataSetState});
  };

  /**
   *
   * @param  {String}           options.name        发生变化的字段名
   * @param  {any}              options.value       变更值
   * @param  {Object|undefined} options.formControlData
   * 如果子元素为 FormControl 则可能携带验证后的数据或自动搜集子元素的 DataSet 数据
   * formControlData 有三种可能值:
   *   1. 验证后的结果。格式为： `{value: '123', isValid: true, message: '', transformed}`
   *   2. DataSet 的 state 数据。格式为：`{data: {}, isValid: true, explains: {}}`
   *   3. undefined。表示 FormControl 没有进行数据验证也没有搜集数据
   * @return {Object}                      新的 DataSetState
   */
  createState({name, value, formControlData}) {
    let formCtrlExplain;
    const {data, explains} = this._dataSetState;
    const dataUpdated = {};

    let isFieldValid = true;
    // FormControl 搜集子元素的结果
    // FormControl 是 DataSet 收集的数据
    if (formControlData && !(formControlData instanceof vajs.Result)) {
      dataUpdated[name] = formControlData.data;
      formCtrlExplain = getNestExplain(formControlData);
      isFieldValid = formControlData.isValid;
    // FormControl 是 vajs.Result 实例
    } else if (formControlData && formControlData instanceof vajs.Result) {
      dataUpdated[name] = formControlData.value;
      formCtrlExplain = getNestExplain(formControlData);
      isFieldValid = formControlData.isValid;
    } else {
      dataUpdated[name] = value;
    }

    // 没有 validator 时的新 state
    let newDataSetState = {
      data: {...data, ...dataUpdated},
      explains,
      nameChanged: name,
      isValid: this._dataSetState.isValid,
      nameSetValidateFailed: this._dataSetState.nameSetValidateFailed
    };

    // 先处理子 form control 自带校验的结果
    if (formCtrlExplain) {
      const newExplains = newDataSetState.explains || {};
      if (isFieldValid) {
        newExplains[name] = newExplains[name] || Explain.success();
      } else {
        newExplains[name] = newExplains[name] || Explain.fail('校验失败');
      }

      // 当前 DataSet 有校验结果
      if (formControlData instanceof vajs.Result) {
        newExplains[name] = formCtrlExplain;
      } else {
        // nestExplain 携带着子 form control 字段自定义校验的结果
        // 当 form 表单也对该字段进行校验时需要通过该字段来判断是否有自定义的校验结果
        // 例子：
        //   const validator = vajs.map({
        //     foo: vajs.v((value, formState) => {
        //       const {explains} = formState;
        //       const explain = explains.foo;
        //       const nestExplain = (explain && explain.nestExplain) || {};
        //       const isValid = formValidFoo(value);
        //       return isValid && nestExplain.type !== Explain.Types.ERROR;
        //     })
        //   });
        newExplains[name].nestExplain = formCtrlExplain;
      }
      newDataSetState.explains = newExplains;
    }

    const {validator} = this.props;
    // 有 validator 时，使用 validate 过后的新 state
    if (validator) {
      const validateState = this.validateAll({
        explains,
        validator,
        data: {...data, ...dataUpdated},
        nameChanged: name
      });
      // 当前 data set 的校验结果和 form control 自带校验同时通过，才认为校验通过
      isFieldValid = isFieldValid && !validateState.nameSetValidateFailed.has(name);
      newDataSetState = validateState;
    }


    if (isFieldValid) {
      newDataSetState.nameSetValidateFailed.delete(name);
    } else {
      newDataSetState.nameSetValidateFailed.add(name);
    }

    newDataSetState.isValid = !newDataSetState.nameSetValidateFailed.size;
    return newDataSetState;
  }

  validateAll(props) {
    // 有时候 props.explains 直接被赋值 defaultExplains
    // 如果不复制一份会导致，defaultExplains 被修改
    const newExplains = props.explains ? {...props.explains} : {};
    const nameChanged = props.nameChanged;
    const result = props.validator.validate(props.data, {
      ...this._dataSetState,
      data: props.data,
      nameChanged
    });

    const invalidKeys = Object.keys(result.message);

    // 当 nameChanged 不为 A 字段，触发了 A 字段校验，
    // 那么上一次校验的结果中如果有子元素结果需要一起判断
    for (const field of Object.keys(newExplains)) {
      if (nameChanged === field) continue;
      const explain = newExplains[field];
      if (explain.nestExplain) {
        const isValid = !result.message[field]
          && explain.nestExplain.type !== Explain.Types.ERROR;
        newExplains[field] = isValid
          ? Explain.success()
          : Explain.fail(result.message[field] || '校验失败');
        newExplains[field].nestExplain = explain.nestExplain;
        result.isValid = result.isValid && isValid;
        !isValid && invalidKeys.push(field);
      }
    }

    if (nameChanged) {
      const oldExplain = newExplains[nameChanged];
      if (nameChanged in result.message) {
        newExplains[nameChanged] = DataSet.messageToExplainByValue(
          props.data[nameChanged],
          result.message[nameChanged]
        );
      } else if (nameChanged) {
        newExplains[nameChanged] = Explain.success();
      }
      if (oldExplain && oldExplain.nestExplain) {
        newExplains[nameChanged].nestExplain = oldExplain.nestExplain;
      }
    }

    return {
      data: result.value,
      explains: newExplains,
      isValid: result.isValid,
      nameChanged,
      nameSetValidateFailed: new Set(invalidKeys)
    };
  }

  renderSubDataSet() {
    return null;
  }

  render() {
    const {children} = this.props;
    const subDataSet = this.renderSubDataSet();
    return (
      <div
        onChange={this.onChange}
        className='data-set'
      >
        {subDataSet || children}
      </div>
    );
  }
}


function getNestExplain({isValid, message, explains}) {
  let explain;
  if (typeof message === 'string') {
    explain = isValid ? Explain.success() : DataSet.messageToExplain(message);
  } else if (explains) {
    explain = isValid ? Explain.success() : Explain.fail('内置校验失败');
    explain.explains = explains;
  }
  return explain;
}
