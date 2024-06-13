import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18의 새로운 API 사용
import { Provider } from 'react-redux';
import store from './store/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
