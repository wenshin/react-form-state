import ExplainBase from './ExplainBase.jsx';

export default class ExplainText extends ExplainBase {
  inline = false;

  renderSub(explain) {
    const {className = ''} = this.props;
    return (
      <span
        className={`form-explain__text ${className}`}
      >
        {explain.message || null}
      </span>
    );
  }
}
