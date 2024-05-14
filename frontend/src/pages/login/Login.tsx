import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<null | string>(null);

  const handleClick = () => {
    try {
      navigate("/CreateAccount");
    } catch (error) {
      console.error("Error ", error);
    }
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
    };

    const username = target.username.value;
    const password = target.password.value;

    try {
      await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }).then((response) => {
        if (response.status === 201) {
          navigate("/");
          //Ändra till profil
        } else if (response.status === 404) {
          setError("Kontrollera användarnamn och lösenord");
        } else if (response.status === 401) {
          setError("Fel lösenord");
        } else if (response.status === 400) {
          setError("Användare redan inloggad");
        } else {
          setError("Fel vid inloggning");
        }
      });
    } catch (error) {
      console.error("Error while login ", error);
    }
  };

  return (
    <>
      <div className='LoginContainer'>
        <div className='form'>
          <form
            className='form-fields'
            action='http://localhost:3000/login'
            method='post'
            onSubmit={submitHandler}>
            <div className='formwrapper'>
              <p className='login'>Logga in</p>
              <label>
                Användarnamn: <input type='text' name='username' />
              </label>
              <label>
                Lösenord: <input type='password' name='password' />
              </label>
              {error && <span className='errormsg'>{error}</span>}
              <input className='submitBtn' type='submit' value='Logga in' />
              <span className='text'>
                Har du inget konto? <br /> Skapa ett för att börja registrera
                dina fångster!
              </span>
              <input
                type='button'
                className='submitBtn'
                value='Skapa konto'
                onClick={handleClick}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
