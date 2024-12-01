import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
 iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FlightMap = ({ flightData }) => {
 if (!flightData) return <div>Loading flight data...</div>;

 const departure = [
   parseFloat(flightData.departure?.latitude) || 0,
   parseFloat(flightData.departure?.longitude) || 0
 ];

 const arrival = [
   parseFloat(flightData.arrival?.latitude) || 0,
   parseFloat(flightData.arrival?.longitude) || 0
 ];

 const currentPosition = flightData.live ? [
   parseFloat(flightData.live.latitude),
   parseFloat(flightData.live.longitude)
 ] : departure;

 return (
   <div style={{ height: '500px', width: '100%' }}>
     <MapContainer
       center={currentPosition}
       zoom={5}
       style={{ height: '100%', width: '100%' }}
     >
       <TileLayer
         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         attribution='&copy; OpenStreetMap contributors'
       />
       
       <Marker position={departure}>
         <Popup>
           <div>
             <h3>Departure</h3>
             <p>Airport: {flightData.departure?.airport || 'N/A'}</p>
             <p>Time: {new Date(flightData.departure?.scheduled).toLocaleString() || 'N/A'}</p>
           </div>
         </Popup>
       </Marker>

       <Marker position={arrival}>
         <Popup>
           <div>
             <h3>Arrival</h3>
             <p>Airport: {flightData.arrival?.airport || 'N/A'}</p>
             <p>Time: {new Date(flightData.arrival?.scheduled).toLocaleString() || 'N/A'}</p>
           </div>
         </Popup>
       </Marker>

       {flightData.live && (
         <Marker position={currentPosition}>
           <Popup>
             <div>
               <h3>Current Position</h3>
               <p>Status: {flightData.flight_status}</p>
               <p>Altitude: {flightData.live.altitude || 'N/A'} ft</p>
               <p>Speed: {flightData.live.speed || 'N/A'} km/h</p>
             </div>
           </Popup>
         </Marker>
       )}

       <Polyline
         positions={[departure, flightData.live ? currentPosition : arrival]}
         color="blue"
         weight={2}
         opacity={0.7}
       />
     </MapContainer>
   </div>
 );
};

export default FlightMap;