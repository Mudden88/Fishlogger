import Modal from "react-modal";
import { useState, FormEvent, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import "./RegisterCatch.css";

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
  species?: string;
  weight?: number;
  length?: number;
  imgurl?: string;
  location?: string;
}

function EditCatch(data: Props) {
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
      species: { value: string };
      weight: { value: number };
      length: { value: number };
      imgurl: { value: string };
      location: { value: string };
    };
    const formData: FormData = {
      species: target.species.value,
      weight: target.weight.value,
      length: target.length.value,
      imgurl: target.imgurl.value,
      location: target.location.value,
    };

    const filterData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== "")
    ) as FormData;

    try {
      const response = await fetch(
        `http://localhost:3000/updateCatch/${data.props}/?token=${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterData),
          credentials: "include",
        }
      );

      if (response.status === 201) {
        await window.location.reload();
        await closeModal();
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
    <div className='Modal'>
      <input
        className='button-42'
        type='button'
        value='Redigera fångst'
        onClick={openModal}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel='Register new catch'
        style={customStyles}>
        <h2>Redigera fångst</h2>
        <p className='closeModal' onClick={closeModal}>
          x
        </p>
        <p>Fyll endast i de fält du vill uppdatera</p>
        {error && <p className='errormsg'>{error}</p>}
        <form className='regForm' onSubmit={submitHandler}>
          <label>
            Art:
            <input type='text' name='species' />
          </label>
          <label>
            Vikt i gram:
            <input type='number' name='weight' />
          </label>
          <label>
            Längd i cm:
            <input type='number' name='length' />
          </label>
          <label>
            Bild:
            <input type='text' name='imgurl' />
          </label>
          <label>
            Plats:
            <input type='text' name='location' />
          </label>
          <input className='button-41' type='submit' value='Skicka' />
        </form>
      </Modal>
    </div>
  );
}

export default EditCatch;
