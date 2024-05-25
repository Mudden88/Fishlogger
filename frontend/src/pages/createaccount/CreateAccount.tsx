import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../login/login.css";

function CreateAccount() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    await navigate("/login");
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      username: { value: string };
      email: { value: string };
      password: { value: string };
    };

    const username = target.username.value;
    const email = target.email.value;
    const password = target.password.value;

    if (username.length < 2) {
      setError("Användarnamn måste vara minst 2 tecken");
    } else if (password.length < 6) {
      setError("Lösenord måste vara minst 6 tecken");
    } else {
      setError(null);
    }

    try {
      const response = await fetch("/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.status === 201) {
        toast.success("Ditt konto har skapats");
        navigate("/login");
      } else if (response.status === 400) {
        setError("Vänligen ange korrekta värden");
      } else if (response.status === 409) {
        setError(
          "En användare finns redan registrerad med det användarnamn eller email"
        );
      }
    } catch (error) {
      console.error("Error while creating account ", error);
    }
  };

  return (
    <>
      <div className='container'>
        <form
          action='/api/createaccount'
          method='post'
          onSubmit={submitHandler}>
          <div className='formwrapper'>
            <p className='create-account'>Skapa konto</p>

            <label>
              Användarnamn: <input type='text' name='username' />
            </label>
            <label>
              Email: <input type='email' name='email' />
            </label>
            <label>
              Lösenord:
              <input type='password' name='password' />
            </label>
            {error && <span className='errorMsg'>{error}</span>}
            <input className='submitBtn' type='submit' value='Skapa konto' />
            <input
              className='submitBtn'
              type='button'
              value='Gå tillbaka'
              onClick={handleClick}
            />
          </div>
        </form>
      </div>
    </>
  );
}
export default CreateAccount;
