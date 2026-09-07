import React, { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
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

      map.setView(position, 15);

    }

  }, [position, map]);

  return null;
};


// ======================================================
// MAP CLICK HANDLER
// ======================================================

const MapClickHandler = ({ setClickedLocation }) => {

  useMapEvents({

    click: (event) => {

      const latitude = event.latlng.lat;

      const longitude = event.latlng.lng;


      // ================================================
      // CONSOLE OUTPUT
      // ================================================

      console.log(
        "================================="
      );

      console.log(
        "MAP CLICKED LOCATION"
      );

      console.log(
        "Latitude:",
        latitude
      );

      console.log(
        "Longitude:",
        longitude
      );

      console.log(
        "================================="
      );


      // ================================================
      // SAVE CLICKED LOCATION
      // ================================================

      setClickedLocation([
        latitude,
        longitude,
      ]);

    },

  });

  return null;
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


  // ====================================================
  // FIND NEARBY SALONS
  // ====================================================

  const handleFindNearbySalons = () => {

    const savedLocation =
      localStorage.getItem("customerLocation");


    // -----------------------------------------------
    // LOCATION NOT FOUND
    // -----------------------------------------------

    if (!savedLocation) {

      alert(
        "Please allow your location first."
      );

      console.log(
        "Customer location not found in localStorage."
      );

      return;
    }


    // -----------------------------------------------
    // CONVERT STRING TO OBJECT
    // -----------------------------------------------

    try {

      const location =
        JSON.parse(savedLocation);


      const latitude =
        Number(location.latitude);

      const longitude =
        Number(location.longitude);


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


      // -----------------------------------------------
      // CURRENT LOCATION CONSOLE
      // -----------------------------------------------

      console.log(
        "================================="
      );

      console.log(
        "CUSTOMER CURRENT LOCATION"
      );

      console.log(
        "Latitude:",
        latitude
      );

      console.log(
        "Longitude:",
        longitude
      );

      console.log(
        "================================="
      );


      // -----------------------------------------------
      // SAVE CUSTOMER LOCATION
      // -----------------------------------------------

      setCustomerLocation([
        latitude,
        longitude,
      ]);


      // -----------------------------------------------
      // SHOW MAP
      // -----------------------------------------------

      setShowMap(true);

    } catch (error) {

      console.error(
        "Error reading customer location:",
        error
      );

    }

  };


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="nearby-salons-section">


      {/* ==================================================
          PAGE HEADER
      ================================================== */}

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
            onClick={handleFindNearbySalons}
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


          {/* ==================================================
              MAP HEADER
          ================================================== */}

          <div className="map-header">

            <div>

              <h2>
                Salons Near You
              </h2>
            </div>

          </div>


          {/* ==================================================
              REAL LEAFLET MAP
          ================================================== */}

          {customerLocation && (

            <MapContainer

              center={customerLocation}

              zoom={15}

              scrollWheelZoom={true}

              className="nearby-leaflet-map"

            >


              {/* ==================================================
                  OPEN STREET MAP
              ================================================== */}

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              {/* ==================================================
                  CUSTOMER CURRENT LOCATION
              ================================================== */}

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


              {/* ==================================================
                  MAP CLICK HANDLER
              ================================================== */}

              <MapClickHandler
                setClickedLocation={setClickedLocation}
              />


              {/* ==================================================
                  CLICKED LOCATION MARKER
              ================================================== */}

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


              {/* ==================================================
                  CENTER MAP ON CUSTOMER
              ================================================== */}

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