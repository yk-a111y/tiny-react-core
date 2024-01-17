function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'string' ?
          createTextNode(child) : child
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
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el]
    }
  };

  root = nextUnitOfWork;
}

// 调度器
let nextUnitOfWork = null;
let root = null; // 程序根节点
function workLoop(deadline) {
  let shouldYield = false;

  while(!shouldYield && nextUnitOfWork) {
    // render逻辑
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

    shouldYield = deadline.timeRemaining() < 1;
  }

  // 无nextUnitOfWork 证明所有节点处理完毕，下一步开始统一提交
  if (!nextUnitOfWork && root) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(root.child);
  // commitRoot仅执行一次
  root = null;
}

function commitWork(fiber) {
  if(!fiber) return;

  // 父组件为函数组件时（函数组件无dom）的处理
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? 
    document.createTextNode("") :
    document.createElement(type);
}

function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  })
}

function initChildren(fiber, children) {
  let prevChild = null;
  children.forEach((child, index) => {
    // 根据child生成新fiber
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      child: null,
      sibling: null,
      dom: null
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

function performUnitOfWork(fiber) {
  // 函数组件的判定
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    console.log(fiber.type());
  }
  // 函数组件不需要创建DOM
  if (!isFunctionComponent) {
    if (!fiber.dom) {
      // 1. 创建DOM
      const dom = fiber.dom = createDom(fiber.type);
      // fiber.parent.dom.append(dom); // 改由commitWork统一提交
      // 2. 处理props
      updateProps(dom, fiber.props);
    }
  }

  // 3. **按照更新顺序生成链表**
  const children = isFunctionComponent ? [fiber.type()] : fiber.props.children;
  initChildren(fiber, children);
  // 4. 返回下一个需要处理的节点
  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  
  return fiber.parent?.sibling;
}

requestIdleCallback(workLoop);

const React = {
  createElement,
  render
}

export default React; 