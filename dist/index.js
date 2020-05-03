"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withTopics = exports.TopicsConsumer = exports.TopicsProvider = exports.TopicsContext = exports.TopicsHOC = void 0;

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// === SETUP ===
const Context = (0, _react.createContext)({}); // === UTILS ===

const _noop = () => {};

const _uuid = () => Math.random().toString(36).substr(2, 9);

const _get = (obj, prop, def = {}) => prop ? obj[prop] : obj || def;

const _toObj = (arr, cb = _noop, def = {}) => arr.reduce((acc, item) => _objectSpread(_objectSpread({}, acc), {}, {
  [item]: cb(acc, item)
}), def); // === DATA BUILDERS ===
// SubscribeData -> { topic: { id: callback, [...] }, [...] }


const _buildSubscribeData = ({
  data,
  topics,
  subs,
  callback = _noop
}) => _toObj(topics, (list, topic) => _objectSpread(_objectSpread({}, _get(list, topic)), {}, {
  [subs[topic]]: payload => callback(topic, payload)
}), _get(data)); // UnsubscribeData -> { topic: { -[id: callback], [...] }, [...] }


const _buildUnsubscribeData = ({
  data,
  topics,
  subs
}) => _toObj(topics, (list, topic) => {
  const _get2 = _get(list, topic),
        _subs$topic = subs[topic],
        {
    [_subs$topic]: omit
  } = _get2,
        rest = _objectWithoutProperties(_get2, [_subs$topic].map(_toPropertyKey));

  return rest;
}, _get(data)); // PublishData -> [fn(), fn(), ...]


const _buildPublishData = ({
  data,
  topic
}) => {
  const callbacks = _get(data, topic);

  if (!callbacks) {
    console.error(`[TOPICS] The "${topic}" topic does not exist.`);
    return [];
  }

  return Object.values(callbacks);
}; // === PROVIDER ===


const Provider = props => {
  const [listeners, setListeners] = (0, _react.useState)({});
  const topics = {
    // Subscribe - Private method
    _subscribe: (topics, callback) => {
      const subs = _toObj(topics, () => _uuid());

      setListeners(data => _buildSubscribeData({
        data,
        topics,
        subs,
        callback
      }));
      return subs;
    },
    // Unsubscribe - Private method
    _unsubscribe: (subs, topics) => {
      setListeners(data => _buildUnsubscribeData({
        data,
        topics,
        subs
      }));
    },
    // Publish - Public method
    publish: (topic, payload = {}) => {
      const data = _buildPublishData({
        data: listeners,
        topic
      });

      data.forEach(cb => cb(payload));
    }
  };
  return /*#__PURE__*/_react.default.createElement(Context.Provider, {
    value: {
      topics
    }
  }, props.children);
}; // === CONSUMER ===


const Consumer = (0, _react.memo)(props => {
  const {
    componentProps,
    component,
    options: {
      topics = []
    },
    topics: {
      _subscribe,
      _unsubscribe,
      publish
    }
  } = props; // Setup event data structure

  const [data, setData] = (0, _react.useState)(_toObj(topics, () => ({})));
  (0, _react.useEffect)(() => {
    if (topics.length === 0) {
      return; // Nothing to subscribe to
    } // Register the subscriptions


    const subscriptions = _subscribe(topics, (topic, payload) => setData(data => _objectSpread(_objectSpread({}, data), {}, {
      [topic]: _objectSpread(_objectSpread({}, data[topic]), payload)
    }))); // Unregister the subscriptions on un-mount


    return () => _unsubscribe(subscriptions, topics); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Render

  return component(_objectSpread(_objectSpread({}, componentProps), {}, {
    topics: {
      data,
      publish
    }
  }));
}); // === HOC ===

const TopicsHOC = (Component, options = {}) => componentProps => {
  return /*#__PURE__*/_react.default.createElement(Context.Consumer, null, contextProps => /*#__PURE__*/_react.default.createElement(Consumer, _extends({
    options: options,
    component: Component,
    componentProps: componentProps
  }, contextProps)));
}; // === EXPORTS ===


exports.TopicsHOC = TopicsHOC;
const TopicsContext = Context;
exports.TopicsContext = TopicsContext;
const TopicsProvider = Provider;
exports.TopicsProvider = TopicsProvider;
const TopicsConsumer = Consumer;
exports.TopicsConsumer = TopicsConsumer;
const withTopics = TopicsHOC;
exports.withTopics = withTopics;