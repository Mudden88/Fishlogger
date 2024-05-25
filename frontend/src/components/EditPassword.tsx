import Modal from "react-modal";
import { useState, FormEvent, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const customStyles = {
  overlay: {
    background: "rgba(17, 15, 29, 0.7)",
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    color: "black",
    borderRadius: "10px",
    maxWidth: "350px",
  },
};

interface Props {
  props: number;
}

interface FormData {
  oldPassword?: string;
  newPassword?: string;
}

function EditPassword(data: Props) {
  Modal.setAppElement("#root");

  const [modalIsOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useContext(AuthContext);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      oldPassword: { value: string };
      newPassword: { value: string };
    };
    const formData: FormData = {
      oldPassword: target.oldPassword.value,
      newPassword: target.newPassword.value,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/changePassword/${data.props}/?token=${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      if (response.status === 201) {
        setError("Lösenord Uppdaterat");
        setTimeout(() => {
          window.location.reload();
          closeModal();
        }, 1500);
      } else if (response.status === 401) {
        setError("Kunde inte hitta användarID");
      } else if (response.status === 400) {
        setError("Vänligen fyll i de fält du vill uppdatera");
      } else {
        setError("Något gick fel, försök igen.");
      }
    } catch (error) {
      console.error("Fel vid registrering av ny fångst", error);
      setError("Fel vid registrering av ny fångst");
    }
  };

  return (
    <div className='userPw'>
      <>
        <p className='userPw' onClick={openModal}>
          -Byt Lösenord-
        </p>
      </>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel='Edit password'
        style={customStyles}>
        <h2>Ändra lösenord</h2>
        <p className='closeModal' onClick={closeModal}>
          x
        </p>
        {error && <p className='errormsg'>{error}</p>}
        <form className='regForm' onSubmit={submitHandler}>
          <label>
            Nuvarande lösenord:
            <input type='password' name='oldPassword' />
          </label>
          <label>
            Nytt lösenord: <br />
            <input type='password' name='newPassword' />
          </label>
          <input className='button-41' type='submit' value='Skicka' />
        </form>
      </Modal>
    </div>
  );
}

export default EditPassword;
