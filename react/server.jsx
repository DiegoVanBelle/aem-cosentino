import { renderToString } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { registry } from './components.jsx';

export function transformHTML(html) {
  const { document } = parseHTML(html);
  document.querySelectorAll('meta[http-equiv]').forEach((meta) => {
    if (meta.getAttribute('http-equiv').toLowerCase() === 'content-security-policy') meta.remove();
  });
  Object.entries(registry).forEach(([name, { Component, readProps }]) => {
    document.querySelectorAll(`main .${name}`).forEach((block) => {
      if (block.hasAttribute('data-react-ssr')) return;
      const props = readProps(block);
      block.setAttribute('data-react-props', JSON.stringify(props));
      block.setAttribute('data-react-ssr', name);
      block.innerHTML = renderToString(<Component {...props} />);
    });
  });
  if (!document.head.querySelector('link[href="/styles/react-tailwind.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', '/styles/react-tailwind.css');
    document.head.append(stylesheet);
  }
  document.body.classList.add('appear');
  return document.toString();
}
