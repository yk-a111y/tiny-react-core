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
}

// 调度器
let nextUnitOfWork = null;
function workLoop(deadline) {
  let shouldYield = false;

  while(!shouldYield && nextUnitOfWork) {
    // render逻辑
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
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

function initChildren(fiber) {
  const children = fiber.props.children;
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
  if (!fiber.dom) {
    // 1. 创建DOM
    const dom = fiber.dom = createDom(fiber.type);

    fiber.parent.dom.append(dom);
    // 2. 处理props
    updateProps(dom, fiber.props);
  }
  // 3. **按照更新顺序生成链表**
  initChildren(fiber);
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