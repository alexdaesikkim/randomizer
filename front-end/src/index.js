import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Random from './Random';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Random />, document.getElementById('root'));
registerServiceWorker();
