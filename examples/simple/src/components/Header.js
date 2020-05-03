import React from "react";
import { withTopics } from "react-topics";

const Header = props => {
  const { data } = props.topics;

  console.log("header", data);

  return (
    <div>
      <p>User: {data.user.name || "No user"}</p>
      <p>System loaded: {(data.system.loaded && "true") || "false"}</p>
    </div>
  );
};

export default withTopics(Header, { topics: ["system", "user"] });
