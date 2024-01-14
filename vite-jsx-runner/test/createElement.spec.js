import { describe, expect, it } from 'vitest';
import { createElement } from '../../core/React.js';
describe('createElement', () => {
  it('should return vDom without props', () => {
    const el = createElement('div', null, 'hi-react');
    expect(el).toEqual({
      type: 'div',
      props: {
        children: [
          {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: 'hi-react',
              children: []
            }
          }
        ]
      }
    })
  })
})