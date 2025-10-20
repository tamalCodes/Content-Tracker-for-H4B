import AuthPage from "@pages/Auth";
import CreatePost from "@pages/CreatePost";
import ForgotPassword from "@pages/ForgotPassword";
import Home from "@pages/Home";
import ViewPost from "@pages/ViewPost";
import withPrivateRoute from "./WithPrivateRoute";
import withUserLoggedInRoute from "./WithUserLoggedInRoute";

const ProtectedHome = withPrivateRoute(Home);
const ProtectedCreatePost = withPrivateRoute(CreatePost);
const ProtectedViewPost = withPrivateRoute(ViewPost);
const AuthOnlyForGuests = withUserLoggedInRoute(AuthPage);
const ForgotPasswordForGuests = withUserLoggedInRoute(ForgotPassword);

const routeConfig = [
  { path: "/", element: <ProtectedHome /> },
  { path: "/create", element: <ProtectedCreatePost mode="create" /> },
  { path: "/edit", element: <ProtectedCreatePost mode="edit" /> },
  { path: "/view", element: <ProtectedViewPost /> },
  { path: "/auth", element: <AuthOnlyForGuests /> },
  { path: "/forgot", element: <ForgotPasswordForGuests /> },
];

export default routeConfig;
