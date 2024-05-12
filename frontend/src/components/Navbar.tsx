import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <nav>
        <ul className='navList'>
          <li>
            <Link to='/'>Hem</Link>
          </li>
          <div className='vl'></div>
          <li>
            <Link to='/Leaderboard'>Rank</Link>
          </li>
          <div className='vl'></div>
          <li>
            <Link to='/Login'>Logga in</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
export default Navbar;
