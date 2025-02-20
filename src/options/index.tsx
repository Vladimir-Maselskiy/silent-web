import { createRoot } from 'react-dom/client';
import './components/Options/options.scss';
import { Options } from './components/Options/Options';
import { MemoryRouter as Router } from 'react-router-dom';

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <Router>
    <Options />
  </Router>
);
