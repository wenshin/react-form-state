import FormChildComponent from './FormChildComponent.jsx';

export default class HelpTips extends FormChildComponent {
  render() {
    const {
      tip,
      className,
      place = 'bottom',
      show = true,
      style = {}
    } = this.props;

    const tipStyle = {
      ...style,
      opacity: show ? 1 : 0
    };

    return (
      <span
        {...this.props}
        className={'help-tips ' + (className || '')}
        style={tipStyle}
      >
        <i
          className='mf mf-question'
          data-tip={tip}
          data-place={place}
          data-effect='solid'
        />
      </span>
    );
  }
}
