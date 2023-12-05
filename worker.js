import { expose } from 'threads/worker';
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

expose({
  async serializePropTypes(modulePathOrPaths) {
    const result = {};
    const components = await import(modulePathOrPaths);
    for (const key in components) {
      if (components[key].propTypes) {
        result[key] = JSON.parse(JSON.stringify(components[key].propTypes));
      }
    }
    return result;
  }
})
