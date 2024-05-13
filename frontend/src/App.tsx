import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import "./App.css";

function Root() {
  return (
    <>
      <h1>
        FISHLOGGER <FontAwesomeIcon icon={faFish} />
      </h1>
      <main>
        <Outlet />
        <Navbar />
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
      ],
      element: <Root />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
