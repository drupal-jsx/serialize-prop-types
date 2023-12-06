import PropTypes from 'prop-types';

// Monkey patch PropTypes so that component prop types can be serialized to
// JSON. This is done in a worker so as not to pollute the main thread's
// PropTypes object.
PropTypes.bool.toJSON = PropTypes.bool.isRequired.toJSON = () => 'boolean';
PropTypes.number.toJSON = PropTypes.number.isRequired.toJSON = () => 'number';
PropTypes.string.toJSON = PropTypes.string.isRequired.toJSON = () => 'string';
PropTypes.object.toJSON = PropTypes.object.isRequired.toJSON = () => 'object';
PropTypes.element.toJSON = PropTypes.element.isRequired.toJSON = () => 'JSX.Element';
PropTypes.shape = new Proxy(PropTypes.shape, {
  apply: function (target, thisArg, argumentsList) {
    const result = target(...argumentsList);
    result.toJSON = result.isRequired.toJSON = () => argumentsList[0];
    return result;
  }
})
PropTypes.arrayOf = new Proxy(PropTypes.arrayOf, {
  apply: function (target, thisArg, argumentsList) {
    const result = target(...argumentsList);
    result.toJSON = result.isRequired.toJSON = () => [argumentsList[0]];
    return result;
  }
})

self.onmessage = async (event) => {
  const result = {};
  const modulePathOrPaths = event.data;

  let components;
  if (typeof modulePathOrPaths === 'string') {
    const module = await import(modulePathOrPaths);
    components = module.default;
  }
  else {
    components = {};
    for (const key in modulePathOrPaths) {
      const module = await import(modulePathOrPaths[key]);
      components[key] = module.default;
    }
  }

  for (const key in components) {
    if (components[key].propTypes) {
      result[key] = JSON.parse(JSON.stringify(components[key].propTypes));
    }
  }
  postMessage(result);
};
