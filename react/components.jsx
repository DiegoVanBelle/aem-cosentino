import { Button, readButtonProps } from './components/Button.jsx';
import { readTeaserProps, Teaser } from './components/Teaser.jsx';

export const registry = {
  'react-teaser': { Component: Teaser, readProps: readTeaserProps },
  'react-button': { Component: Button, readProps: readButtonProps },
};
