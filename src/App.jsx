import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AuthPage from "./pages/Auth";
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
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
