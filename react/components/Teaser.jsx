import { useState } from 'react';

export function Teaser({ title, description }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article>
      <h2>{title}</h2><p>{description}</p>
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>More information</button>
      {expanded && <p>Contact our team to learn more.</p>}
    </article>
  );
}

export const readTeaserProps = (block) => {
  const rows = [...block.children];
  return {
    title: rows[0]?.textContent.trim() || 'Discover more',
    description: rows[1]?.textContent.trim() || '',
  };
};
