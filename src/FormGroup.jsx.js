import FormChild from './FormChild.jsx';

export default class FormGroup extends FormChild {
  renderTitle() {
    const {title} = this.props;
    return title ? (
      <h2
        className='form__group-title'
        dangerouslySetInnerHTML={{__html: title}}
      />
    ) : null;
  }

  renderChildren() {
    return this.props.children;
  }

  render() {
    return (
      <div className='form__group'>
        {this.renderTitle()}
        {this.renderChildren()}
      </div>
    );
  }
}
