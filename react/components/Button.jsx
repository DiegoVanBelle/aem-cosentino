import { useState } from 'react';

export function Button({ label }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button type="button" aria-pressed={pressed} onClick={() => setPressed((value) => !value)}>
      {label}
    </button>
  );
}

export const readButtonProps = (block) => ({
  label: block.firstElementChild?.textContent.trim() || 'Button',
});
