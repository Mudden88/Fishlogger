import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import "../index.css";

function Navbar() {
  const { token, setLoggedIn, loggedIn } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await fetch(`/api/logout?token=${token}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((response) => {
          if (response.status === 200) {
            toast.success("Du är nu utloggad");
            setLoggedIn(false);
          }
        })
        .then(() => {
          window.location.reload();
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
          <Link to='/Leaderboard'>Rankinglista</Link>
        </li>
        {token && loggedIn ? (
          <li>
            <Link to='/Profile'>Profil</Link>
          </li>
        ) : (
          <li>
            <Link to='/Login'>Logga in / Skapa konto</Link>
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
