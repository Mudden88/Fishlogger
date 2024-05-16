import { useState, useEffect } from "react";
import "./profile.css";

function Profile() {
  const token = localStorage.getItem("isLoggedIn");
  const [user, setUser] = useState<userProfile | null>(null); // Börja med att sätta user till null

  interface userProfile {
    username: string;
    email: string;
    species: string;
    weight: number;
    length: number;
    c_r: number;
    password: string;
    token: string;
  }

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:3000/userProfile?token=${token}`)
        .then((response) => response.json())
        .then((result) => {
          setUser(result);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          setUser(null);
        });
    }
  }, [token]);

  return (
    <>
      {token ? (
        user ? (
          <div className='user-profile'>
            <h1>Hejsan</h1>
            <p>Email: {user.token}</p>
          </div>
        ) : (
          <p>Laddar användare</p>
        )
      ) : (
        <p>Du behöver logga in för att komma åt den här sidan</p>
      )}
    </>
  );
}

export default Profile;
