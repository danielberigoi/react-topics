import React from "react";
import { withTopics } from "../services/events";

const Content = props => {
  const { publish } = props.topics;

  return (
    <pre>
      <button onClick={() => publish("system", { loaded: true })}>
        Notify that the system is loaded
      </button>
      <button onClick={() => publish("user", { name: "Daniel" })}>
        Notify user update
      </button>
      <button
        onClick={() => {
          publish("system", { loaded: false });
          publish("user", { name: null });
        }}
      >
        Reset
      </button>
    </pre>
  );
};

export default withTopics(Content);
