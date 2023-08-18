import { hydrateRoot } from 'react-dom/client';
import App from './App';

const domNode = document.getElementById('root');

// server.tsx 是使用了renderToString来生成html结构的，然后 domNode 需要和 server 替换的要相同
hydrateRoot(domNode!, <App />);