import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import "./App.css";

function Root() {
  return (
    <>
      <Navbar />
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
      ],
      element: <Root />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
