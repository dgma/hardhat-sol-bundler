const { identity, composeFromEntires } = require('./utils');


describe('utils: identity', () => {
  it('should return input', () => {
    expect(identity(10)).toBe(10)
  });
});

describe('composeFromEntires', () => { 
  it('should run passed function and update each value for object values', () => {
    const modifier = jest.fn(num => num + 2);
    const input = Object.entries({
      a: 10,
      b: 20,
    });
    const output = {
      a: 12,
      b: 22,
    };

    expect(composeFromEntires(input, modifier)).toEqual(output);
    expect(modifier).toHaveBeenCalledTimes(2);
  });
})