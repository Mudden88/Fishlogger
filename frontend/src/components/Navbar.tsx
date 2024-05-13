import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import "../index.css";

function Navbar() {
  return (
    <nav>
      <h1 className='fishlogger'>
        Fishlogger {""}
        <FontAwesomeIcon className='fishIco' icon={faFish} />
      </h1>
      <ul className='navList'>
        <li>
          <Link to='/'>Hem</Link>
        </li>
        <li>
          <Link to='/Leaderboard'>Rank</Link>
        </li>
        <li>
          <Link to='/Login'>Logga in</Link>
        </li>
        <li>
          <Link to='/Profile'>Profil</Link>
        </li>
      </ul>
    </nav>
  );
}
export default Navbar;
