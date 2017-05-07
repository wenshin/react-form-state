import ExplainBase from './ExplainBase.jsx';

export default class ExplainText extends ExplainBase {
  inline = false;

  renderExplain(explain) {
    return (
      <span
        className='form-explain__text'
      >
        {explain.message || null}
      </span>
    );
  }
}
