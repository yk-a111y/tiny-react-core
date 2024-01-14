function createElement(type, props, ...children) {
  return {
    type,
    props,
    children: children.map(child => {
      return typeof child === 'string' ?
        createTextNode(child) : child
    })
  }
}

function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text
    },
    children: []
  }
}

function render(el, container) {
  const dom = el.type === 'TEXT_ELEMENT' ? 
    document.createTextNode("") :
    document.createElement(el.type);

  Object.keys(el.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  })

  const children = el.children;
  children.forEach(child => {
    render(child, dom);
  })

  container.append(dom);
}

export const React = {
  createElement,
  render
}