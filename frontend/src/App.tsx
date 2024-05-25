import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { AuthContext } from "./context/AuthProvider";
import { useContext } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/createaccount/CreateAccount";
import Profile from "./pages/profile/Profile";
import Contact from "./components/Contact";
import "./App.css";

function Root() {
  return (
    <>
      <Navbar />
      <ToastContainer position='top-right' autoClose={2000} theme='dark' />
      <main>
        <Outlet />
      </main>
      <Contact />
    </>
  );
}

function App() {
  const { loggedIn } = useContext(AuthContext);
  const router = createBrowserRouter([
    {
      children: [
        { element: <Home />, path: "/" },
        { element: <Leaderboard />, path: "/Leaderboard" },
        { element: <Login />, path: "/Login" },
        { element: <CreateAccount />, path: "/CreateAccount" },
        {
          element: loggedIn ? <Profile /> : <Navigate to='/login' replace />,
          path: "/Profile",
        },
      ],
      element: <Root />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
