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
      <button
        onClick={() => {
          notify("system", { loaded: false });
          notify("user", { name: null });
        }}
      >
        Reset
      </button>
    </pre>
  );
};

export default withEvents(Content);
