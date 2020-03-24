# React simple notification service

## Summary

Provides the ability to subscribe and push notifications to separate topics.

## Disclaimer
This is an abstraction over the React `context` API. This is not a replacement for any state-management libraries like `redux`. Although the result is similar, the purpose here is to simplify the boilerplate work as much as possible.

## How
<table>
  <tr>
    <td><img src="https://s5.gifyu.com/images/Untitled-Diagram-1.png"/><hr/><img width="200px" src="https://s5.gifyu.com/images/Screen-Recording-2020-03-22-at-16.37.07.gif"/></td>
    <td><b>Components can subscribe to different topics and to push notifications to different topics.</b><br/><br/>For instance, the <b>Header</b> component is subscribed to <i>user</i> and <i>system</i> topics. The <b>Footer</b>
      is subscribed only to the <i>system</i> topic. The <b>Content</b> notifies each topic that the data has been changed, and passes the payload data with it. Each time any update is sent to these topics, the subscribed components gets re-rendered.
<br/><br/>To send an update to a topic, use the  <i>notify</i> method. Both <i>notify</i> and  <i>data</i> are properties found under <b>props.events</b>.<br/>
      
      
</td>
</tr>
</table>

> Check the examples below for more information. The service implementation can be found here: https://github.com/danielberigoi/react-notify/blob/master/src/services/events.js

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
- The components are automatically subscribed to the passed-in topics on first render.
- The components are automatically unsubscribed on component un-mount.
- The components are memoized using React's `memo`.
