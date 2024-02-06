import React from '../core/React.js'

let count = 10;
let showBar = false
// export const App = React.createElement('div', { id: 'app'}, 'yk-test');
function Counter({ num }) {
  const foo = (
    <div id="foo">
      foo
      <div>foo child</div>
    </div>
  )
  const bar = <p id="bar">bar</p>

  const handleClick = () => {
    console.log('handleClick');
    // count++;
    showBar = !showBar;
    React.update();
  }
  return (
    <div id="count-container">
      Counter
      {/* <div id="container">{ showBar ? bar : foo}</div> */}
      {showBar && bar}
      <button onClick={handleClick}>showBar</button>
    </div>
  )
}
// function CounterContainer() {
//   return <Counter />
// }

let barCount = 1;
function Bar() {
  console.log("bar rerun");
  const update = React.update();
  const handleClick = () => {
    barCount += 1;
    update();
  }
  return (
    <div>
      bar count: {barCount}
      <button onClick={handleClick}>bar count</button>
    </div>
  )
}

let fooCount = 1;
function Foo() {
  console.log("foo rerun");
  const update = React.update();
  const handleClick = () => {
    fooCount += 1;
    update();
  }
  return (
    <div>
      foo count: {fooCount}
      <button onClick={handleClick}>foo count</button>
    </div>
  )
}

let currentRoot = 1;
function App() {
  console.log("app rerun");

  const update = React.update();
  const handleClick = () => {
    currentRoot = currentRoot + 1;
    update();
  }
  return (
    <div>
      hi mini-react count : {currentRoot}
      <button onClick={handleClick}>app count</button>
      <Foo />
      <Bar />
      {/* <Counter num={10} /> */}
      {/* <Counter num={20} /> */}
      {/* <CounterContainer /> */}
    </div>
  )
}

export default App