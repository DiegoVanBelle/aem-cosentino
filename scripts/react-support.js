// Keep this selector aligned with react/components.jsx's explicit registry.
export const REACT_BLOCKS = '.react-teaser, .react-button';

/** Run synchronous vanilla decorators without exposing React-owned children. */
export function withReactIslands(container, decorate) {
  const blocks = [...container.querySelectorAll(REACT_BLOCKS)];
  if (container.matches?.(REACT_BLOCKS)) blocks.unshift(container);
  const saved = blocks.map((block) => [block, [...block.childNodes]]);
  saved.forEach(([block]) => block.replaceChildren());
  try { return decorate(); } finally {
    saved.forEach(([block, children]) => block.replaceChildren(...children));
  }
}
