import React from "react";
import { withEvents } from "../services/events";

const Footer = props => {
  const { data } = props.events;

  return (
    <div>
      <p>System loaded: {(data.system.loaded && "true") || "false"}</p>
    </div>
  );
};

export default withEvents(Footer, { topics: ["system"] });
