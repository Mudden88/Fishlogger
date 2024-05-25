import { useEffect, useState } from "react";
import RegisterCatch from "../../components/RegisterCatch";
import "./leaderboard.css";

interface LeaderboardRes {
  index: number;
  id: number;
  user_id: number;
  username: string;
  species: string;
  weight: number;
  length: number;
  c_r: number;
  location: string;
  imgurl: string;
  created: string;
}

function Leaderboard() {
  const [catches, setCatches] = useState<LeaderboardRes[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const apiUrl: string = "http://localhost:3000/leaderboard";
  const isLoggedIn = localStorage.getItem("isUser");

  useEffect(() => {
    try {
      fetch(`${apiUrl}`)
        .then((response) => response.json())
        .then((result: LeaderboardRes[]) => {
          setCatches(result);
          setLoading(false);
        });
    } catch (error) {
      console.error("Error while fetching results", error);
    }
  }, []);

  return (
    <>
      <div className='Lcontainer'>
        <h1>LEADERBOARD</h1>
        {isLoggedIn && <RegisterCatch />}
        <p>Topp 100</p>

        {loading ? (
          <p>Laddar resultat...</p>
        ) : (
          <div className='tableWrap'>
            <table className='leaderboard-results'>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Användare</th>
                  <th>Art</th>
                  <th>Längd</th>
                  <th>Vikt</th>
                  <th className='hide'>C&R</th>
                  <th className='hide-sc'>Plats</th>
                  <th>Bild</th>
                  <th className='hide'>Upplagd</th>
                </tr>
              </thead>
              <tbody>
                {catches &&
                  catches.slice(0, 100).map((fish, index) => (
                    <tr key={fish.id}>
                      <td>{index + 1 === 1 ? <span>1</span> : index + 1}</td>
                      <td>{fish.username}</td>
                      <td>{fish.species}</td>
                      <td>{fish.length}cm</td>
                      <td>{fish.weight}gr</td>
                      <td className='hide'>{fish.c_r ? "Ja " : "Nej "}</td>
                      <td className='hide-sc'>
                        {fish.location ? fish.location : "n/a"}
                      </td>
                      <td>
                        {fish.imgurl ? (
                          <a
                            className='imgurl'
                            href={fish.imgurl}
                            target='_blanc'>
                            Bild
                          </a>
                        ) : (
                          "n/a"
                        )}
                      </td>
                      <td className='hide'>{fish.created}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
export default Leaderboard;
