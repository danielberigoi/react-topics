# React simple pub-sub service

## Summary
Provides the ability to subscribe React components to defined topics.

### Getting started

```bash
npm install react-topics
```

### App.js

Wrap the main application with the `TopicsProvider` component.

```javascript
import Header from "./components/Header";
import Content from "./components/Content";
import { TopicsProvider } from "react-topics";

const App = () => {
  return (
    <TopicsProvider>
      <div className="App">
        <Header />
        <Content />
      </div>
    </TopicsProvider>
  );
};
```

### Header.js - Subscriber example

To consume the topic data, wrap the component with the `withTopics` HOC.

- A component can subscribe to one or multiple topics.
- The topic data can be found under `props.topics.data`
- The topic data is structured per topic. For instance, if the component is subscribed to the `system` topic, the data will be found under `props.topics.data.system`

```javascript
import { withTopics } from "react-topics";

const Header = props => {
  const { data } = props.topics;

  return (
    <div>
      <p>User: {data.user.name || "No user"}</p>
      <p>System loaded: {(data.system.loaded && "true") || "false"}</p>
    </div>
  );
};

// Specify the topics you want this component to listen to
export default withTopics(Header, { topics: ["system", "user"] });
```

### Content.js - Publisher example

To publish an update, wrap the component with the `withTopics` HOC.

- When you `publish` on a specific topic, all components that are subscribed will be updated.
- The payload sent with each notification is automatically merged, there is no need to extend any previous data.

```javascript
import { withTopics } from "react-topics";

const Content = props => {
  const { publish } = props.topics;

  return (
    <pre>
      <button onClick={() => publish("system", { loaded: true })}>
        Notify that the system is loaded
      </button>
      <button onClick={() => publish("user", { name: "John" })}>
        Notify user update
      </button>
    </pre>
  );
};

export default withTopics(Content);
```

## Examples
- [Simple Example](https://github.com/danielberigoi/react-topics/tree/master/examples/simple)

## Disclaimer
This is an abstraction over the React `context` API. This is not a replacement for any state-management libraries like `redux`.
The purpose here is to simplify the boilerplate work as much as possible.

## Technical Info
- The components are automatically subscribed to the passed-in topics on first render.
- The components are automatically unsubscribed on component un-mount.
- The components are memoized using React's `memo`.
