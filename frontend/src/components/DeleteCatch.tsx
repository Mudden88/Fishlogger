import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";

interface Props {
  props: number;
}

function DeleteCatch(data: Props) {
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      if (data.props && token) {
        const response = await fetch(
          `http://localhost:3000/deleteCatch/${data.props}?token=${token}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (response.status === 204) {
          setMessage("Fångst raderad, uppdaterar profil");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (response.status === 401) {
          setMessage("Unatuhorized request");
        } else if (response.status === 404) {
          setMessage("Ingen fångst kunde hittas");
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  return (
    <>
      <span className='button-43' onClick={handleClick}>
        Ta bort
      </span>
      {message && <span className='errormsg'>{message}</span>}
    </>
  );
}
export default DeleteCatch;
