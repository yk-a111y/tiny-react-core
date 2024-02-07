// v1 -> 传统方法操作DOM
// const dom = document.createElement('div');
// dom.id = 'app';
// document.querySelector('#root').append(dom);

// const textNode = document.createTextNode('')
// textNode.nodeValue = 'yk-test';

// dom.append(textNode);

// v2 React 声明式编程
import React from '../core/React.js';
import { ReactDOM } from '../core/ReactDOM.js';
// import App from './App.jsx';
import App from './App_useState.jsx';

ReactDOM.createRoot(document.querySelector('#root')).render(<App />);