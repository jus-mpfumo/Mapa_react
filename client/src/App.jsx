import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

// Corrige problema clássico do ícone do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Componente para recentrar o mapa quando a posição muda
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

// Conecta ao backend Socket.IO
const socket = io("https://mapareact-production.up.railway.app");

function App() {
  const [position, setPosition] = useState(null); // tua posição
  const [users, setUsers] = useState({}); // todos os utilizadores conectados

  // Observa a tua posição e envia ao servidor
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("Latitude:", pos.coords.latitude);
        console.log("Longitude:", pos.coords.longitude);
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        socket.emit("updateLocation", coords); // envia ao servidor
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Recebe do servidor a lista de todos os utilizadores
  useEffect(() => {
    socket.on("usersUpdate", (data) => {
      console.log("Utilizadores conectados:", data);
      console.log("Total conectados:", Object.keys(data).length);
      setUsers(data);
    });

    return () => socket.off("usersUpdate");
  }, []);

  if (!position) return <p>A obter localização...</p>;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Renderiza um marcador para cada utilizador */}
        {Object.values(users).map((userCoords, index) => (
          <Marker key={index} position={userCoords} />
        ))}

        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
}

export default App;