import {FormField} from 'react-form-state';

export default class FormFooterField extends FormField {
  renderField() {
    const {data, isValid} = this.form;
    return (
      <div>
        <p>
          <button disabled={!isValid}>提交表单</button>
          {!isValid ? <small>&nbsp;&nbsp;表单没有正确填写</small> : null}
        </p>
        {JSON.stringify({data, isValid})}
      </div>
    );
  }
}