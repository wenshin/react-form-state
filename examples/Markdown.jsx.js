import {markdown} from 'markdown';
import {Component, PropTypes} from 'react';

export default class Markdown extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired
  };

  render() {
    const {children} = this.props;
    return children ? (
      <div dangerouslySetInnerHTML={{__html: markdown.toHTML(children)}} />
    ) : null;
  }
}
