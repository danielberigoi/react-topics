import React, { createContext, useState, useEffect, memo } from "react";

// SETUP
const EventContext = createContext({});
EventContext.displayName = "EventContext";

// UTILS
const noop = () => {};
const get = (obj, prop, defaults = {}) => (prop ? obj[prop] : obj || defaults);
const toObj = (arr, val = noop, defaults = {}) => arr.reduce((acc, item) => ({ ...acc, [item]: val(acc, item) }), defaults);
const uuid = () => Math.random().toString(36).substr(2, 9);

// DATA BUILDER - Subscribe -> { topic: { id: callback, [...] }, [...] }
const buildSubscribeData = ({ data, topics, subs, callback = noop }) =>
  toObj(topics, (list, topic) => ({
    ...get(list, topic),
    [subs[topic]]: payload => callback(topic, payload)
  }), get(data));

// DATA BUILDER - Unsubscribe -> { topic: { -[id: callback], [...] }, [...] }
const buildUnsubscribeData = ({ data, topics, subs }) =>
  toObj(topics, (list, topic) => {
    const { [subs[topic]]: omit, ...rest } = get(list, topic);
    return rest;
  }, get(data));

// DATA BUILDER - Notify -> [fn(), fn(), ...]
const buildNotifyData = ({ data, topic }) => {
  const callbacks = get(data, topic);
  if (!callbacks) {
    console.error(`[EVENTS] The "${topic}" topic does not exist.`);
    return [];
  }
  return Object.values(callbacks);
};

// MAIN - Provider
export const EventProvider = props => {
  const [listeners, setListeners] = useState({});
  const events = {
    // Subscribe - Private method
    _subscribe: (topics, callback) => {
      const subs = toObj(topics, () => uuid());
      setListeners(data =>
        buildSubscribeData({ data, topics, subs, callback })
      );
      return subs;
    },
    // Unsubscribe - Private method
    _unsubscribe: (subs, topics) => {
      setListeners(data => buildUnsubscribeData({ data, topics, subs }));
    },
    // Notify - Public method
    notify: (topic, payload = {}) => {
      const data = buildNotifyData({ data: listeners, topic });
      data.forEach(cb => cb(payload));
    }
  };

  return (
    <EventContext.Provider value={{ events }}>
      {props.children}
    </EventContext.Provider>
  );
};

const EventConsumer = memo(props => {
  const {
    componentProps,
    component,
    options: { topics = [] },
    events: { _subscribe, _unsubscribe, notify }
  } = props;

  // Setup event data structure
  const [data, setData] = useState(toObj(topics, () => ({})));

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
  }, []);

  // Render
  return component({ ...componentProps, events: { data, notify } });
});

// withEvents HOC
export const withEvents = (Component, options = {}) => componentProps => {
  return (
    <EventContext.Consumer>
      {contextProps => (
        <EventConsumer
          options={options}
          component={Component}
          componentProps={componentProps}
          {...contextProps}
        />
      )}
    </EventContext.Consumer>
  );
};
