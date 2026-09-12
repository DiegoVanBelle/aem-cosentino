import { useState } from 'react';

export function Teaser({ title, description }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="tw:box-border tw:rounded-2xl tw:border tw:border-solid tw:border-stone-300 tw:bg-stone-100 tw:p-6 tw:sm:p-10 tw:text-stone-900">
      <h2 className="tw:m-0 tw:text-3xl tw:sm:text-4xl tw:font-bold tw:tracking-tight tw:leading-tight tw:break-words">{title}</h2>
      <p className="tw:mt-4 tw:mb-6 tw:max-w-2xl tw:text-lg tw:leading-relaxed tw:text-stone-600 tw:break-words">{description}</p>
      <button
        className={'tw:box-border tw:inline-flex tw:min-h-12 tw:max-w-full tw:items-center tw:justify-center '
          + 'tw:rounded-full tw:border-2 tw:border-solid tw:border-stone-900 tw:bg-stone-900 tw:px-6 tw:py-3 '
          + 'tw:text-base tw:font-semibold tw:leading-normal tw:text-white tw:whitespace-normal tw:cursor-pointer '
          + 'tw:hover:bg-stone-700 tw:focus-visible:outline-3 tw:focus-visible:outline-solid '
          + 'tw:focus-visible:outline-stone-900 tw:focus-visible:outline-offset-4'}
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        More information
      </button>
      {expanded && (
        <p className="tw:mt-6 tw:mb-0 tw:border-0 tw:border-l-4 tw:border-solid tw:border-stone-400 tw:pl-4 tw:text-base tw:text-stone-700">
          Contact our team to learn more.
        </p>
      )}
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
