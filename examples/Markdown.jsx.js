import marked from 'marked';
import prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import {Component, PropTypes} from 'react';

const renderer = new marked.Renderer();

renderer.codespan = function codespan(text, level) {
  return `<code class="codespan">${text}</code>`
}

marked.setOptions({
  renderer,
  highlight(code, lang) {
    return prism.highlight(code, prism.languages[lang], lang);
  }
});

export default class Markdown extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired
  };

  render() {
    const {children} = this.props;
    return children ? (
      <div dangerouslySetInnerHTML={{__html: marked(children)}} />
    ) : null;
  }
}


export function Code(props) {
  const {lang, code, children} = props;
  const html = prism.highlight(code || children, prism.languages[lang], lang);
  return (
    <pre>
      <code className={`language-${lang}`} dangerouslySetInnerHTML={{__html: html}} />
    </pre>
  );
}
