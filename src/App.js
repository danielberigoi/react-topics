import React from "react";
import Header from "./components/Header";
import Content from "./components/Content";
import Footer from "./components/Footer";
import { EventProvider } from "./services/events";

const App = () => {
  return (
    <EventProvider>
      <div className="App">
        <Header />
        <Content />
        <Footer />
      </div>
    </EventProvider>
  );
};

export default App;
