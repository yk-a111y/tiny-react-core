function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
      })
    }
  }
}

function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    },
  }
}

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  };

  nextUnitOfWork = wipRoot;
}

// 调度器
let nextUnitOfWork = null;
let wipRoot = null; // 程序根节点(Work In Progress树的根节点)
let currentRoot = null; // 保存某次更新的新树
let deletions = []; // 需要删除的DOM节点数组
let wipFiber; // 保存当前更新的fiber；性能优化需要，从存在更新的fiber开始进行fiber树的遍历
function workLoop(deadline) {
  let shouldYield = false;

  while(!shouldYield && nextUnitOfWork) {
    // render逻辑
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

    if (wipRoot?.sibling?.type === nextUnitOfWork?.type) {
      // console.log('hit', wipRoot, nextUnitOfWork);
      nextUnitOfWork = undefined;
    }

    shouldYield = deadline.timeRemaining() < 1;
  }

  // 无nextUnitOfWork 证明所有节点处理完毕，下一步开始统一提交
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  // commitRoot仅执行一次
  wipRoot = null;

  deletions = [];
}
function commitDeletion(fiber) {
  fiber.parent.dom.removeChild(fiber.dom);
}

function commitWork(fiber) {
  if(!fiber) return;

  // 父组件为函数组件时（函数组件无dom）的处理
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  // 根据effectTag判断执行更新 or 初始化逻辑
  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === 'placement') {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? 
    document.createTextNode("") :
    document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
  // 1. prevProps有，但nextProps没有
  Object.keys(prevProps).forEach(key => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  // 2. nextProps有，但prevProps没有
  Object.keys(nextProps).forEach(key => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        // 实现事件绑定
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLocaleLowerCase();
          dom.removeEventListener(eventType, prevProps[key]); // 注册事件之前，现将旧事件取消。否则会重复注册
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  })
}

function reconcileChildren(fiber, children) {
  // update时，获取old fiber tree 上的节点
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      // type类型相同 => 更新
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: oldFiber.dom, // 更新态dom不变
        alternate: oldFiber,
        effectTag: 'update'
      }
    } else {
      // type类型不同 => 根据child生成新fiber(删除旧的，创建新的)
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          parent: fiber,
          child: null,
          sibling: null,
          dom: null,
          effectTag: 'placement'
        }
      }
      if (oldFiber) {
        console.log("should delete", oldFiber)
        deletions.push(oldFiber);
      }
    }

    // oldFiber存在的话 => 为更新逻辑，继续访问兄弟节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    if (newFiber) {
      prevChild = newFiber;
    }
  });

  while(oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber;

  stateHooks = [];
  stateHookIndex = 0;
  // 3. **按照更新顺序生成链表**
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 1. 创建DOM
    const dom = fiber.dom = createDom(fiber.type);
    // fiber.parent.dom.append(dom); // 改由commitWork统一提交
    // 2. 处理props
    updateProps(dom, fiber.props, {});
  }
  // 3. **按照更新顺序生成链表**
  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

function performUnitOfWork(fiber) {
  // 函数组件的判定
  const isFunctionComponent = typeof fiber.type === 'function';
  
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 3. **按照更新顺序生成链表**
  // const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children;
  // reconcileChildren(fiber, children);
  // 4. 返回下一个需要处理的节点
  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }

  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(workLoop);

function update() {
  let currentFiber = wipFiber;

  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber, // alternate指向old fiber tree 对应的节点
    };
  
    nextUnitOfWork = wipRoot;
  }
}


let stateHooks;
let stateHookIndex;
function useState(initial) {
  let currentFiber = wipFiber;
  // 按顺序取出oldHook。这也是为什么useState不可以在if else语句中调用，因为可能导致顺序错乱
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : []
  }

  stateHook.queue.forEach(action => {
    stateHook.state = action(stateHook.state);
  })
  stateHook.queue = [];

  stateHookIndex++
  stateHooks.push(stateHook);

  currentFiber.stateHooks = stateHooks;

  function setState(action) {
    // action 推入更新队列；action不是函数的话，需要包裹一层函数，将action作为返回值
    stateHook.queue.push(typeof action === 'function' ? action : () => action);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber, // alternate指向old fiber tree 对应的节点
    };
  
    nextUnitOfWork = wipRoot;
  }

  return [stateHook.state, setState];
}

const React = {
  createElement,
  render,
  update,
  useState
}

export default React; 