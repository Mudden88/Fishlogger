import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

function Home() {
  const [usersOnline, setUserOnline] = useState<number>(0);
  const apiUrl: string = "http://localhost:3000/getUsers?getUser=mudden";

  useEffect(() => {
    try {
      fetch(`${apiUrl}`)
        .then((response) => response.json())
        .then((result: number) => {
          setUserOnline(result);
        });
    } catch (error) {
      console.error("Error fetching users");
    }
  }, []);
  return (
    <>
      <div className='container'>
        <span className='usersOnline'>Användare online: {usersOnline} </span>
        <h2>
          Välkommen till Fishlogger <FontAwesomeIcon icon={faFish} /> - Din
          digitala fiskelogg
        </h2>

        <h3>Registrera dina fångster</h3>
        <p>
          Logga dina fisketurer och registrera varje fångst med detaljer som
          fiskart, vikt, längd och bild. Bygg upp din egen personliga
          fiskdatabas och få en överblick över din utveckling som fiskare.
        </p>
        <h3>För statistik över dina fiskeäventyr</h3>
        <p>
          Utforska detaljerad statistik över dina fisketurer. Se trender och
          fångstfrekvens för att optimera ditt fiske och öka dina chanser att
          fånga den stora fisken!
        </p>
        <h3>Jämför dig med andra fiskare</h3>
        <p>
          De fiskar du loggar hamnar även på en global rankinglista där du kan
          sortera efter art, vikt eller längd för att se vem som är den
          nuvarande ledaren. Klättra på upp rankingen genom att logga nya fiskar
          till din statistik.
        </p>
      </div>
    </>
  );
}
export default Home;
