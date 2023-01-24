const identity = val => val;
const promiseIdentity = val => Promise.resolve(val);

const composeFromEntires = (
  entries = Object.entries({}), 
  valueMapper = identity
) => entries.reduce(
  (acc, [key, value]) => ({
    ...acc,
    [key]: valueMapper(value)
  }),
  {}
);

const composeFromEntiresAsync = async (
  entries = Object.entries({}), 
  valueMapper = promiseIdentity
) => await entries.reduce(
  async (promise, [key, value]) => promise.then(
    async acc => ({
      ...acc,
      [key]: await valueMapper(value)
    })
  ),
  Promise.resolve({})
);


module.exports = {
  identity,
  composeFromEntires,
  composeFromEntiresAsync,
}