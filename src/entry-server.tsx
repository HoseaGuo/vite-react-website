import { renderToString } from 'react-dom/server';
import App from './App'

// Articles token: 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
export function render() {
  return renderToString(<App />);
}