import React from "react";
import Header from "./components/Header";
import Content from "./components/Content";
import Footer from "./components/Footer";
import { TopicsProvider } from "react-topics";

const App = () => {
  return (
    <TopicsProvider>
      <div className="App">
        <Header />
        <Content />
        <Footer />
      </div>
    </TopicsProvider>
  );
};

export default App;
