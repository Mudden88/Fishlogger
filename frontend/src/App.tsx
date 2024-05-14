import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/createaccount/CreateAccount";
import "./App.css";

function Root() {
  return (
    <>
      <Navbar />
      <ToastContainer position='top-right' autoClose={6000} theme='dark' />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      children: [
        { element: <Home />, path: "/" },
        { element: <Leaderboard />, path: "/Leaderboard" },
        { element: <Login />, path: "/Login" },
        { element: <CreateAccount />, path: "/CreateAccount" },
      ],
      element: <Root />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
