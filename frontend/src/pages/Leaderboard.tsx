import { useEffect, useState } from "react";
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
        {loading ? (
          <p>Laddar resultat...</p>
        ) : (
          <table className='leaderboard-results'>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Användare</th>
                <th>Art</th>
                <th>Längd</th>
                <th>Vikt</th>
                <th>C&R</th>
                <th>Plats</th>
                <th>Bild</th>
                <th>Upplagd</th>
              </tr>
            </thead>
            <tbody>
              {catches &&
                catches.map((fish, index) => (
                  <tr key={fish.id}>
                    <td>{index + 1 === 1 ? <span>1</span> : index + 1}</td>
                    <td>{fish.username}</td>
                    <td>{fish.species}</td>
                    <td>{fish.length}cm</td>
                    <td>{fish.weight}gr</td>
                    <td>{fish.c_r ? "Ja " : "Nej "}</td>
                    <td>{fish.location}</td>
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
                    <td>{fish.created}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
export default Leaderboard;
