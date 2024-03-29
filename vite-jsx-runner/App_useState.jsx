import React from '../core/React.js';

function App() {
  console.log('run App');
  const [count, setCount] = React.useState(0);
  const [bar, setBar] = React.useState(0);

  function handleClick() {
    setCount((count) => {
      return count;
    })
  }

  function handleBarClick() {
    setBar((bar) => {
      return bar + '1';
    })

    setBar('test')
  }

  return (
    <div>
      count: { count }
      <button onClick={handleClick}>点击</button>
      bar: { bar }
      <button onClick={handleBarClick}>点击</button>
    </div>
  )
}

export default App;
