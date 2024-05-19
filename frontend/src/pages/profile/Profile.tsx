import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import "./profile.css";

function Profile() {
  const token = localStorage.getItem("isLoggedIn");

  const [user, setUser] = useState<userProfile | null>(null);
  const [catches, setCatches] = useState<UserCatch[] | null>(null);
  const [add, setAdd] = useState<boolean>(false);

  interface userProfile {
    id: number;
    user_id: number;
    username: string;
    email: string;
    account_created: string;
  }

  interface UserCatch {
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
    catch_created: string;
  }

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:3000/userProfile?token=${token}`)
        .then((response) => response.json())
        .then((result) => {
          setUser(result[0]);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          setUser(null);
        });
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3000/userCatches/${user.user_id}?token=${token}`)
        .then((response) => response.json())
        .then((result) => {
          setCatches(result);
        })
        .catch((error) => {
          console.error("Error fetching user catches", error);
        });
    }
  }, [token, user]);

  const handleClick = () => {
    if (add === false) {
      setAdd(true);
    }
  };

  return (
    <div className='container-profile'>
      {token ? (
        user ? (
          <>
            <div className='user-profile'>
              <FontAwesomeIcon className='fishIcon' icon={faFish} />
              <span className='userName'>{user.username}</span>
              <img
                className='ProfilePic'
                src='https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                alt='Profile picture'
              />
              <p className='userId'>Användar-ID: 0{user.user_id}</p>
              <p className='userMail'>
                Email: {user.email} <br />
              </p>
              <p className='userCreated'>
                Medlem sedan: {user.account_created}
              </p>
              <hr />
              <input
                className='button-41'
                type='button'
                value='Lägg till'
                onClick={handleClick}
              />
            </div>
            <div className='userCatches'>
              {catches && catches.length > 0 ? (
                catches.map((fish) => (
                  <div key={fish.id} className='catchItem'>
                    <p className='created'>{fish.catch_created}</p>
                    {fish.imgurl ? (
                      <a href={fish.imgurl} target='_blanc'>
                        <img
                          className='fishImg'
                          src={fish.imgurl}
                          alt='User uploaded fish'
                        />
                      </a>
                    ) : (
                      <img
                        className='fishImg'
                        src='../—Pngtree—vector picture icon_4013511.png'
                        alt='Image by pngtree.com'
                        width='180px'
                      />
                    )}

                    <div className='fishInfo'>
                      <table>
                        <thead>
                          <tr>
                            <th>Art</th>
                            <th>Vikt</th>
                            <th>Längd</th>
                            <th>C&R</th>
                            <th>Plats</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{fish.species}</td>
                            <td>{fish.weight} gr</td>
                            <td>{fish.length} cm</td>
                            <td>{fish.c_r === 1 ? "Ja" : "Nej"}</td>
                            <td>{fish.location ? fish.location : "n/a"} </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <p className='noFish'>
                  Du har inte laddat upp något ännu, tryck på knappen nedan för
                  att börja logga dina fiskar!
                </p>
              )}
            </div>
          </>
        ) : (
          <p className='LoadingUser'>Laddar användare</p>
        )
      ) : (
        <p className='error'>
          Du behöver logga in för att komma åt den här sidan
        </p>
      )}
    </div>
  );
}

export default Profile;
