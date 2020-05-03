import React from "react";
import { withTopics } from "react-topics";

const Footer = props => {
  const { data } = props.topics;

  return (
    <div>
      <p>System loaded: {(data.system.loaded && "true") || "false"}</p>
    </div>
  );
};

export default withTopics(Footer, { topics: ["system"] });
