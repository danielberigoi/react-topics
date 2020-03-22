# React simple pub-sub service

## Summary

Provides the ability to subscribe a component to multiple topics, and to push notifications to multiple topics.

For instance, `component1` is subscribed to `user` and `system` topics.
Each time any update is sent to these topics, the component gets re-rendered.
To send an update to a topic, use the `notify` method.

> `notify` and `data` are properties found under `events`.
Check the examples below for more information.

## Examples

### App.js

Wrap the main application with the `EventProvider` component.

```javascript
import React from "react";
import Header from "./components/Header";
import Content from "./components/Content";
import { EventProvider } from "./services/events";

const App = () => {
  return (
    <EventProvider>
      <div className="App">
        <Header />
        <Content />
      </div>
    </EventProvider>
  );
};
```

### ExampleComponent1.js

To consume the event data, wrap the component with the `withEvents` HOC.

- A component can subscribe to one or multiple topics.
- The event data can be found under `props.events.data`
- The event data is structured per topic. For instance, if the component is subscribed to the `system` topic, the data will be found under `props.events.data.system`

```javascript
import { withEvents } from "../services/events";

const Header = props => {
  const { data } = props.events;

  return (
    <div>
      <p>User: {data.user.name || "No user"}</p>
      <p>System loaded: {(data.system.loaded && "true") || "false"}</p>
    </div>
  );
};

// Pass the topics you want this component to listen to
export default withEvents(Header, { topics: ["system", "user"] });
```

### ExampleComponent2.js

To notify an update, wrap the component with the `withEvents` HOC.

- When you `notify` on a specific topic, all components that are subscribed will be updated.
- The payload sent with each notification is automatically merged, there is no need to extend any previous data.

```javascript
import React from "react";
import { withEvents } from "../services/events";

const Content = props => {
  const { notify } = props.events;

  return (
    <pre>
      <button onClick={() => notify("system", { loaded: true })}>
        Notify that the system is loaded
      </button>
      <button onClick={() => notify("user", { name: "Daniel" })}>
        Notify user update
      </button>
    </pre>
  );
};

export default withEvents(Content);
```

## Important
- The components are automatically subscribed on first render.
- The components are automatically unsubscribed on un-mount.