import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './helloworld.css';

function CounterCard({ title, description }) {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-card">
      <div className="counter-card__content">
        <span className="counter-card__label">React Component</span>

        <h2 className="counter-card__title">
          {title}
        </h2>

        <p className="counter-card__description">
          {description}
        </p>

        <div className="counter-card__counter">
          <button
            className="counter-card__button"
            onClick={() => setCount(count - 1)}
          >
            −
          </button>

          <span className="counter-card__value">
            {count}
          </span>

          <button
            className="counter-card__button"
            onClick={() => setCount(count + 1)}
          >
            +
          </button>
        </div>

        <button
          className="counter-card__reset"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function decorate(block) {
  const root = createRoot(block);

  root.render(
    <CounterCard
      title="Hello World"
      description="This is a React component rendered inside your block."
    />
  );
}