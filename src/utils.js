const identity = val => val;

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


module.exports = {
  identity,
  composeFromEntires,
}