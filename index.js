import React, { createContext, useState, useEffect, memo } from "react";

// === SETUP ===
const Context = createContext({});

// === UTILS ===
const _noop = () => {};
const _uuid = () => Math.random().toString(36).substr(2, 9);
const _get = (obj, prop, def = {}) => (prop ? obj[prop] : obj || def);
const _toObj = (arr, cb = _noop, def = {}) => arr.reduce((acc, item) => ({ ...acc, [item]: cb(acc, item) }), def);

// === DATA BUILDERS ===
// SubscribeData -> { topic: { id: callback, [...] }, [...] }
const _buildSubscribeData = ({ data, topics, subs, callback = _noop }) =>
  _toObj(topics, (list, topic) => ({
    ..._get(list, topic),
    [subs[topic]]: payload => callback(topic, payload)
  }), _get(data));

// UnsubscribeData -> { topic: { -[id: callback], [...] }, [...] }
const _buildUnsubscribeData = ({ data, topics, subs }) =>
  _toObj(topics, (list, topic) => {
    const { [subs[topic]]: omit, ...rest } = _get(list, topic);
    return rest;
  }, _get(data));

// PublishData -> [fn(), fn(), ...]
const _buildPublishData = ({ data, topic }) => {
  const callbacks = _get(data, topic);
  if (!callbacks) {
    console.error(`[TOPICS] The "${topic}" topic does not exist.`);
    return [];
  }
  return Object.values(callbacks);
};

// === PROVIDER ===
const Provider = props => {
  const [listeners, setListeners] = useState({});
  const topics = {
    // Subscribe - Private method
    _subscribe: (topics, callback) => {
      const subs = _toObj(topics, () => _uuid());
      setListeners(data =>
        _buildSubscribeData({ data, topics, subs, callback })
      );
      return subs;
    },
    // Unsubscribe - Private method
    _unsubscribe: (subs, topics) => {
      setListeners(data => _buildUnsubscribeData({ data, topics, subs }));
    },
    // Publish - Public method
    publish: (topic, payload = {}) => {
      const data = _buildPublishData({ data: listeners, topic });
      data.forEach(cb => cb(payload));
    }
  };

  return (
    <Context.Provider value={{ topics }}>
      {props.children}
    </Context.Provider>
  );
};

// === CONSUMER ===
const Consumer = memo(props => {
  const {
    componentProps,
    component,
    options: { topics = [] },
    topics: { _subscribe, _unsubscribe, publish }
  } = props;

  // Setup event data structure
  const [data, setData] = useState(_toObj(topics, () => ({})));

  useEffect(() => {
    if (topics.length === 0) {
      return; // Nothing to subscribe to
    }
    // Register the subscriptions
    const subscriptions = _subscribe(topics, (topic, payload) =>
      setData(data => ({ ...data, [topic]: { ...data[topic], ...payload }}))
    );
    // Unregister the subscriptions on un-mount
    return () => _unsubscribe(subscriptions, topics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render
  return component({ ...componentProps, topics: { data, publish } });
});

// === HOC ===
export const TopicsHOC = (Component, options = {}) => componentProps => {
  return (
    <Context.Consumer>
      {contextProps => (
        <Consumer
          options={options}
          component={Component}
          componentProps={componentProps}
          {...contextProps}
        />
      )}
    </Context.Consumer>
  );
};

// === EXPORTS ===
export const TopicsContext = Context;
export const TopicsProvider = Provider;
export const TopicsConsumer = Consumer;
export const withTopics = TopicsHOC;