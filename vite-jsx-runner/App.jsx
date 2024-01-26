import React from '../core/React.js'

let count = 10;
// export const App = React.createElement('div', { id: 'app'}, 'yk-test');
function Counter({ num }) {
  const handleClick = () => {
    console.log('handleClick');
    count++;
    React.update();
  }
  return <button onClick={handleClick}>count: { count }</button>
}
// function CounterContainer() {
//   return <Counter />
// }

function App() {
  const handleClick = () => {
    console.log('handleClick');
  }
  return (
    <div onClick={handleClick}>
      mini-react
      <Counter num={10} />
      {/* <Counter num={20} /> */}
      {/* <CounterContainer /> */}
    </div>
  )
}

export default App