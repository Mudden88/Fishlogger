import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import "./App.css";

function Root() {
  return (
    <>
      <div className='siteWrapper'>
        <h1>
          FISHLOGGER <FontAwesomeIcon icon={faFish} />
        </h1>
        <main>
          <Outlet />
        </main>
        <Navbar />
      </div>
    </>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      children: [{ element: <Home />, path: "/" }],
      element: <Root />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
