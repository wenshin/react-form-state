import {Field} from 'react-form-state';

export default class FormFooterField extends Field {
  renderField() {
    const {data, isValid} = this.form;
    return (
      <div>
        <p>
          <button disabled={!isValid}>提交表单</button>
          {!isValid ? <small>&nbsp;&nbsp;表单没有正确填写</small> : null}
        </p>
        <pre>{JSON.stringify({data, isValid}, null, 2)}</pre>
      </div>
    );
  }
}
