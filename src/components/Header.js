import React from "react";
import { withEvents } from "../services/events";

const Header = props => {
  const { data } = props.events;

  console.log("header", data);

  return (
    <div>
      <p>User: {data.user.name || "No user"}</p>
      <p>System loaded: {(data.system.loaded && "true") || "false"}</p>
    </div>
  );
};

export default withEvents(Header, { topics: ["system", "user"] });
