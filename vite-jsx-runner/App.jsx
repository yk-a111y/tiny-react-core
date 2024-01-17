import React from '../core/React.js'

// export const App = React.createElement('div', { id: 'app'}, 'yk-test');
function Counter() {
  return <div>count</div>
}
function CounterContainer() {
  return <Counter />
}
const App = <div>
  mini-react
  <CounterContainer />
</div>

export default App