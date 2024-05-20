import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import "../index.css";

function Navbar() {
  const token = localStorage.getItem("isLoggedIn");

  const handleLogout = async () => {
    try {
      await fetch(`http://localhost:3000/logout?token=${token}`, {
        method: "DELETE",
      }).then((response) => {
        if (response.status === 200) {
          toast.success("Du är nu utloggad");
          localStorage.removeItem("isLoggedIn");

          const path = window.location.pathname;
          window.location.replace(path);
        }
      });
    } catch (error) {
      console.error("Error while logout ", error);
    }
  };

  return (
    <nav>
      <h1 className='fishlogger'>
        Fishlogger {""}
        <FontAwesomeIcon className='fishIco' icon={faFish} />
      </h1>
      <ul className='navList'>
        <li>
          <Link to='/'>Start</Link>
        </li>
        <li>
          <Link to='/leaderboard'>Rankinglista</Link>
        </li>
        {token ? (
          <li>
            <Link to='/profile'>Profil</Link>
          </li>
        ) : (
          <li>
            <Link to='/login'>Logga in / Skapa konto</Link>
          </li>
        )}

        {token ? (
          <li className='logOut' onClick={handleLogout}>
            Logga ut
          </li>
        ) : (
          ""
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
