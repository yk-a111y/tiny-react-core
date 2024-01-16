let taskId = 1;

function workLoop(deadline) {
  taskId++;

  let shouldYield = false;
  while(!shouldYield) {
    // render逻辑
    console.log(`taskId:${taskId} run`);

    shouldYield = deadline.timeRemaining() < 1;
  }

  // requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);