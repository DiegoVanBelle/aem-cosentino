import './quote.css';
const { createRoot } = ReactDOM;

function QuoteCard({ quote, author }) {
  const [liked, setLiked] = useState(false);

  return React.createElement(
    'div',
    { className: 'quote-card' },

    React.createElement(
      'div',
      { className: 'quote-card__quote' },
      `"${quote}"`
    ),

    React.createElement(
      'div',
      { className: 'quote-card__author' },
      `— ${author}`
    ),

    React.createElement(
      'button',
      {
        className: 'quote-card__button',
        onClick: () => setLiked(!liked)
      },
      liked ? '♥ Liked' : '♡ Like'
    )
  );
}

export default function decorate(block) {
  const root = createRoot(block);

  root.render(
    React.createElement(QuoteCard, {
      quote: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs'
    })
  );
}