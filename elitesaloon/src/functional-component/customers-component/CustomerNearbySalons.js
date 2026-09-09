import React, { useState, useEffect } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Polyline,
    useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import {
    FaMapMarkerAlt,
    FaSearchLocation,
} from "react-icons/fa";

import "leaflet/dist/leaflet.css";
import "./CustomerDashboard.css";


// ======================================================
// FIX DEFAULT LEAFLET MARKER ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ======================================================
// CUSTOM ICON FOR CLICKED LOCATION
// ======================================================

const clickedLocationIcon = new L.Icon({
    iconUrl:
        "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",

    iconSize: [32, 32],

    iconAnchor: [16, 32],

    popupAnchor: [0, -32],
});


// ======================================================
// CHANGE MAP CENTER
// ======================================================

const ChangeMapCenter = ({ position }) => {

    const map = useMap();

    useEffect(() => {

        if (position) {

            map.setView(position, 13);

        }

    }, [position, map]);

    return null;
};


// ======================================================
// MAP CLICK HANDLER
// ======================================================

const MapClickHandler = ({ setClickedLocation, handleFindNearbySalons }) => {

    useMapEvents({

        click: (event) => {

            const latitude = event.latlng.lat;
            const longitude = event.latlng.lng;

            console.log("MAP CLICKED LOCATION");
            console.log("Latitude:", latitude);

            console.log("Longitude:", longitude);

            // SAVE CLICKED LOCATION
            setClickedLocation([latitude, longitude,]);

            // Find salons for clicked location
            handleFindNearbySalons(latitude, longitude);
        },

    });

    return null;
};

//Routeline

const RouteLine = ({ from, to }) => {
    const [route, setRoute] = useState([]);

    useEffect(() => {
        if (!from || !to) return;

        const getRoute = async () => {
            try {
                const url =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${from[1]},${from[0]};${to[1]},${to[0]}` +
                    `?overview=full&geometries=geojson`;

                const response = await fetch(url);
                const data = await response.json();

                if (
                    data.routes &&
                    data.routes.length > 0
                ) {
                    const coordinates =
                        data.routes[0].geometry.coordinates;

                    const leafletCoordinates =
                        coordinates.map(([longitude, latitude]) => [
                            latitude,
                            longitude
                        ]);

                    setRoute(leafletCoordinates);
                }
            } catch (error) {
                console.error("Route error:", error);
            }
        };

        getRoute();
    }, [from, to]);

    if (route.length === 0) {
        return null;
    }

    return (
        <Polyline
            positions={route}
            pathOptions={{
                color: "blue",
                weight: 5,
                opacity: 0.8
            }}
        />
    );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const CustomerNearbySalons = () => {

    const [showMap, setShowMap] = useState(false);

    const [customerLocation, setCustomerLocation] =
        useState(null);

    const [clickedLocation, setClickedLocation] =
        useState(null);

    const [nearbySalons, setNearbySalons] =
        useState([]);

    // ====================================================
    // FIND NEARBY SALONS
    // ====================================================

    const handleFindNearbySalons = async (latitude, longitude) => {



        try {


            // const latitude = Number(21.16885646764516);
            // const longitude = Number(72.86287307739259);

            latitude = Number(latitude);
            longitude = Number(longitude);
            // -----------------------------------------------
            // VALIDATE COORDINATES
            // -----------------------------------------------

            if (
                Number.isNaN(latitude) ||
                Number.isNaN(longitude)
            ) {

                console.error(
                    "Invalid customer coordinates."
                );

                return;
            }

            // CURRENT LOCATION CONSOLE


            console.log(
                "CUSTOMER CURRENT LOCATION");

            console.log("Latitude:", latitude);

            console.log("Longitude:", longitude);

            // SAVE CUSTOMER LOCATION

            setCustomerLocation([
                latitude,
                longitude,
            ]);

            const response = await fetch("http://localhost:5000/customer/nearby-salons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    latitude: latitude,
                    longitude: longitude,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Server error: ${response.status}`
                );
            }

            // -----------------------------------------------
            // CONVERT RESPONSE TO JSON
            // -----------------------------------------------

            const data = await response.json();

            console.log("Nearby Salon Data:", data);

            console.log("Total Salons:", data.totalSalons);

            console.log("Owners:", data.owners);

            setNearbySalons(
                data.owners || []
            );

            setShowMap(true);


        } catch (error) {

            console.error(
                "Error reading customer location:",
                error
            );

        }

    };


    return (

        <div className="nearby-salons-section">
            <div className="nearby-salons-header">
                <div>
                    <h1>
                        Nearby Salons
                    </h1>
                    <p>
                        Find salons near your current location
                    </p>

                </div>
                <FaMapMarkerAlt
                    className="nearby-header-icon"
                />

            </div>


            {/* ==================================================
          BEFORE MAP
      ================================================== */}

            {!showMap ? (

                <div className="find-salon-card">


                    <div className="find-salon-icon">

                        <FaSearchLocation />

                    </div>


                    <h2>
                        Find Salons Near You
                    </h2>


                    <p>
                        Discover salons around your current
                        location and explore available services.
                    </p>


                    <button
                        type="button"
                        className="find-nearby-salon-btn"
                        onClick={() => {

                            navigator.geolocation.getCurrentPosition(

                                (position) => {

                                    const latitude =
                                        position.coords.latitude;

                                    const longitude =
                                        position.coords.longitude;

                                    handleFindNearbySalons(
                                        latitude,
                                        longitude
                                    );

                                },

                                (error) => {

                                    console.error(
                                        "Location error:",
                                        error
                                    );

                                    alert(
                                        "Please allow location access."
                                    );

                                }

                            );

                        }}
                    >
                        <FaMapMarkerAlt />

                        Find Nearby Salons
                    </button>


                </div>

            ) : (


                /* ==================================================
                   MAP SECTION
                ================================================== */

                <div className="nearby-map-container">




                    <div className="map-header">

                        <div>

                            <h2>
                                Salons Near You
                            </h2>
                        </div>

                    </div>



                    {customerLocation && (

                        <MapContainer

                            center={customerLocation}

                            zoom={13}

                            scrollWheelZoom={true}

                            className="nearby-leaflet-map"

                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <Marker
                                position={customerLocation}
                            >
                                <Popup>

                                    <div className="nearby-location-popup">

                                        <strong>
                                            Your Current Location
                                        </strong>

                                        <div>
                                            Latitude:
                                            {" "}
                                            {customerLocation[0]}
                                        </div>

                                        <div>
                                            Longitude:
                                            {" "}
                                            {customerLocation[1]}
                                        </div>

                                    </div>

                                </Popup>

                            </Marker>
                            {nearbySalons.map((salon) => {

                                const latitude =
                                    Number(salon.latitude);

                                const longitude =
                                    Number(salon.longitude);

                                if (
                                    Number.isNaN(latitude) ||
                                    Number.isNaN(longitude)
                                ) {
                                    console.warn(
                                        "Invalid salon coordinates:",
                                        salon
                                    );

                                    return null;
                                }

                                return (
                                    <Marker
                                        key={salon.ownerId}
                                        position={[
                                            latitude,
                                            longitude
                                        ]}
                                    >

                                        <Popup>

                                            <div className="nearby-location-popup">

                                                <strong>
                                                    {salon.ownerShopName || "Salon"}
                                                </strong>

                                                {salon.address?.street && (
                                                    <div>
                                                        Address:
                                                        {" "}
                                                        {salon.address.street}
                                                    </div>
                                                )}

                                                <div>
                                                    Latitude: {latitude}
                                                </div>

                                                <div>
                                                    Longitude: {longitude}
                                                </div>

                                                {salon.distance !== undefined && (
                                                    <div>
                                                        Distance: {salon.distance} km
                                                    </div>
                                                )}

                                            </div>

                                        </Popup>

                                    </Marker>
                                );
                            })}

                            {clickedLocation &&
                                nearbySalons.map((salon) => {
                                    const latitude = Number(salon.latitude);
                                    const longitude = Number(salon.longitude);

                                    if (
                                        Number.isNaN(latitude) ||
                                        Number.isNaN(longitude)
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <RouteLine
                                            key={`route-${salon.ownerId}`}
                                            from={clickedLocation}
                                            to={[latitude, longitude]}
                                        />
                                    );
                                })}

                            <MapClickHandler
                                setClickedLocation={setClickedLocation}
                                handleFindNearbySalons={handleFindNearbySalons}
                            />

                            {clickedLocation && (

                                <Marker
                                    position={clickedLocation}
                                    icon={clickedLocationIcon}
                                >

                                    <Popup>

                                        <div className="nearby-location-popup">

                                            <strong>
                                                Selected Location
                                            </strong>

                                            <div>
                                                Latitude:
                                                {" "}
                                                {clickedLocation[0]}
                                            </div>

                                            <div>
                                                Longitude:
                                                {" "}
                                                {clickedLocation[1]}
                                            </div>

                                        </div>

                                    </Popup>

                                </Marker>

                            )}

                            <ChangeMapCenter
                                position={customerLocation}
                            />

                        </MapContainer>

                    )}

                </div>

            )}

        </div>

    );

};


export default CustomerNearbySalons;