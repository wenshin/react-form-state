import Explain from './Explain.jsx';

export default class ExplainText extends Explain {
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
