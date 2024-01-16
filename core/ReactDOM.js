import React from './React.js';

export const ReactDOM = {
  createRoot(container) {
    return {
      render(App) {
        return React.render(App, container);
      }
    }
  }
}