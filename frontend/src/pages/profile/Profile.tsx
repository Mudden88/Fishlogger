import { useState, useEffect } from "react";
import "./profile.css";

function Profile() {
  const token = localStorage.getItem("isLoggedIn");
  const [users, setUsers] = useState<userProfile[]>([]);

  interface userProfile {
    username: string;
    email: string;
    species: string;
    weight: number;
    length: number;
    c_r: number;
    password: string;
    token: string;
    user_id: number;
  }

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:3000/userProfile?token=${token}`)
        .then((response) => response.json())
        .then((result) => {
          setUsers(result);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          setUsers([]);
        });
    }
  }, [token]);

  return (
    <>
      <div className='container'>
        {token ? (
          users.length > 0 ? (
            users.map((user, index) => (
              <div className='user-profile' key={index}>
                <h2>{user.username}</h2>
                <p>Email: {user.email}</p>
                <h3>Dina fångster:</h3>
                <p>Art: {user.species}</p>

                <p>Vikt: {user.weight}</p>
              </div>
            ))
          ) : (
            <p>Laddar användare</p>
          )
        ) : (
          <p>Du behöver logga in för att komma åt den här sidan</p>
        )}
      </div>
    </>
  );
}

export default Profile;
