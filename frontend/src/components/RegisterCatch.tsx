import Modal from "react-modal";
import { useState, FormEvent } from "react";
import "./RegisterCatch.css";

const customStyles = {
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

function RegisterCatch() {
  Modal.setAppElement("#root");

  const [modalIsOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("isLoggedIn");

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
      c_r: { checked: boolean };
      imgurl: { value: string };
      location: { value: string };
    };

    const species = target.species.value;
    const weight = target.weight.value;
    const length = target.length.value;
    const c_r = target.c_r.checked;
    const imgurl = target.imgurl.value;
    const location = target.location.value;

    try {
      const response = await fetch(
        `http://localhost:3000/newCatch?token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            species,
            weight,
            length,
            c_r,
            imgurl,
            location,
          }),
        }
      );

      if (response.status === 201) {
        closeModal();
      } else if (response.status === 401) {
        setError("Kunde inte hitta användarID");
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
        className='button-41'
        type='button'
        value='Lägg till fångst'
        onClick={openModal}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel='Register new catch'
        style={customStyles}>
        <h2>Lägg till fångst</h2>
        <p className='closeModal' onClick={closeModal}>
          x
        </p>
        {error && <p className='error'>{error}</p>}
        <form
          className='regForm'
          onSubmit={submitHandler}
          encType='multipart/form-data'>
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
            C&R:
            <input type='checkbox' name='c_r' />
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

export default RegisterCatch;
