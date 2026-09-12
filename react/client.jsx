import { createRoot, hydrateRoot } from 'react-dom/client';
import { registry } from './components.jsx';

const roots = new WeakMap();
export function mount(block) {
  if (roots.has(block)) return;
  const name = Object.keys(registry).find((key) => block.classList.contains(key));
  if (!name) return;
  const { Component, readProps } = registry[name];
  const ssr = block.getAttribute('data-react-ssr') === name;
  const props = ssr ? JSON.parse(block.getAttribute('data-react-props')) : readProps(block);
  const element = <Component {...props} />;
  const root = ssr ? hydrateRoot(block, element) : createRoot(block);
  if (!ssr) root.render(element);
  roots.set(block, root);
}
