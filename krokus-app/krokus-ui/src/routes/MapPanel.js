export default function MapPanel({observations }) {

    const markers = obsesrvations.map(observation =>
        <Marker position={[...observation.location].reverse()} key={observation.id}>
            <Popup>
                {observation.title}
            </Popup>
        </Marker>
    );

    return (
        <MapContainer className="full-height" center={[51.505, -0.09]} zoom={13}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers}
        </MapContainer>    
    );
} 