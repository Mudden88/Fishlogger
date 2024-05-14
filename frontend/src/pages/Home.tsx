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
        <span className='usersOnline'>Antal inloggade: {usersOnline} </span>
        <h2>Välkommen till Fishlogger - Din digitala fiskelogg</h2>

        <h3>Registrera dina fiskefångster</h3>
        <p>
          Dokumentera dina fisketurer och spara varje fångst med detaljer som
          fiskart, vikt, längd och bilder. Bygg upp din personliga
          fångststatistik och få en överblick över din utveckling som fiskare.
        </p>
        <h3>Få djupgående statistik om dina fiskeäventyr</h3>
        <p>
          Utforska detaljerad statistik över dina fisketurer. Upptäck trender
          och fångstfrekvenser för att optimera ditt fiske och öka dina chanser
          att fånga den stora fisken!
        </p>
        <h3>Jämför dig med andra passionerade fiskare</h3>
        <p>
          Dina fiskeupplevelser syns på en global rankinglista där du kan
          jämföra dig med andra fiskare. Sortera listan efter art, vikt eller
          längd för att se vem som för närvarande toppar. Stig i rank genom att
          logga fler fångster och visa upp din imponerande fångststatistik!
        </p>
      </div>
    </>
  );
}
export default Home;
