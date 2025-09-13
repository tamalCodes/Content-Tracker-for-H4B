import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CreatePost from "./pages/CreatePost";
import Home from "./pages/Home";
import ViewPost from "./pages/ViewPost";

// QvNsxiYnVaaRmNAC

const App = () => {
  return (
    <Router>
      <main>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route
            exact
            path="/create"
            element={<CreatePost mode={"create"} />}
          />
          <Route exact path="/edit" element={<CreatePost mode={"edit"} />} />
          <Route exact path="/view" element={<ViewPost />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
