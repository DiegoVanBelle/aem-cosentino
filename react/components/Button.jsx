import { useState } from 'react';

export function Button({ label }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      className={'tw:box-border tw:inline-flex tw:min-h-12 tw:max-w-full tw:items-center tw:justify-center '
          + 'tw:rounded-full tw:border-2 tw:border-solid tw:border-stone-900 tw:bg-stone-900 tw:px-8 tw:py-3 '
          + 'tw:text-base tw:font-semibold tw:leading-normal tw:text-white tw:whitespace-normal tw:cursor-pointer '
          + 'tw:hover:bg-stone-700 tw:aria-pressed:bg-stone-200 tw:aria-pressed:text-stone-900 '
          + 'tw:aria-pressed:hover:bg-stone-300 tw:focus-visible:outline-3 tw:focus-visible:outline-solid '
          + 'tw:focus-visible:outline-stone-900 tw:focus-visible:outline-offset-4'}
      type="button"
      aria-pressed={pressed}
      onClick={() => setPressed((value) => !value)}
    >
      {label}
    </button>
  );
}

export const readButtonProps = (block) => ({
  label: block.firstElementChild?.textContent.trim() || 'Button',
});
