import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import Swal from "sweetalert2";
import "react-phone-input-2/lib/style.css";
import "../../components/Form.css";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useLoader from "../../hooks/useLoader";
import CommonLoader from "../../components/CommonLoader";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "leaflet/dist/leaflet.css";

const OwnerRegistration = () => {
  const { loading, startLoading, stopLoading } = useLoader();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerMobile: "",
    ownerShopName: "",
    ownerShopCertificate: null,
    shopFrontPhoto: null,
    shopInsidePhoto: null,
    ownerShopStreet: "",
    ownerShopPincode: "",
    ownerShopCity: "",
    ownerShopBlock: "",
    ownerShopDistrict: "",
    ownerShopState: "",
    ownerLatitude: "",
    ownerLongitude: "",
  });

  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const [showMap, setShowMap] = useState(false);

  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  const locationIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
const getAddressFromLocation = async (
  lat,
  lng,
  setForm,
  setPostOffices
) => {
  try {
    console.log("Getting address...");
    console.log("Latitude:", lat);
    console.log("Longitude:", lng);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    console.log("Address Data:", data);

    if (!data.address) {
      Swal.fire(
        "Address Not Found",
        "Location mil gayi hai, lekin address details nahi mil paayi.",
        "warning"
      );
      return;
    }

    const address = data.address;

    const street =
      address.road ||
      address.neighbourhood ||
      address.suburb ||
      "";

    const pincode = address.postcode || "";

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "";

    const district =
      address.state_district ||
      address.county ||
      "";

    const state = address.state || "";

    console.log("Street:", street);
    console.log("Pincode:", pincode);
    console.log("City:", city);
    console.log("District:", district);
    console.log("State:", state);

    // Address auto-fill
    setForm((prev) => ({
      ...prev,
      ownerLatitude: lat,
      ownerLongitude: lng,
      ownerShopStreet: street,
      ownerShopPincode: pincode,
      ownerShopCity: city,
      ownerShopDistrict: district,
      ownerShopState: state,
    }));

    // ================= PINCODE API =================

    if (/^\d{6}$/.test(pincode)) {
      console.log("Getting Post Office Details...");

      const pinResponse = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      const pinData = await pinResponse.json();

      console.log("Pincode Data:", pinData);

      if (
        pinData[0] &&
        pinData[0].Status === "Success" &&
        pinData[0].PostOffice
      ) {
        const offices = pinData[0].PostOffice;

        setPostOffices(offices);

        const first = offices[0];

        setForm((prev) => ({
          ...prev,

          ownerLatitude: lat,
          ownerLongitude: lng,

          ownerShopPincode: pincode,

          ownerShopBlock: first?.Name || "",

          ownerShopCity:
            first?.Block ||
            prev.ownerShopCity ||
            city,

          ownerShopDistrict:
            first?.District ||
            prev.ownerShopDistrict ||
            district,

          ownerShopState:
            first?.State ||
            prev.ownerShopState ||
            state,
        }));
      }
    }
  } catch (error) {
    console.error("Address Error:", error);

    Swal.fire(
      "Address Error",
      "Location mil gayi hai, lekin address details nahi mil paayi.",
      "warning"
    );
  }
};
function LocationMarker({
  locationIcon,
  setForm,
  setLocation,
  setPostOffices,
  setShowMap,
}) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      console.log("MAP CLICKED");
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);

      // Marker
      setPosition(e.latlng);

      // Save location
      setLocation({
        latitude: lat,
        longitude: lng,
      });

      // Save lat/lng
      setForm((prev) => ({
        ...prev,
        ownerLatitude: lat,
        ownerLongitude: lng,
      }));

      // Get address
      getAddressFromLocation(
        lat,
        lng,
        setForm,
        setPostOffices
      ).then(() => {
        setShowMap(false);
      });
    },
  });

  return position ? (
    <Marker position={position} icon={locationIcon}>
      <Popup>
        <b>Selected Location</b>
        <br />
        Latitude: {position.lat}
        <br />
        Longitude: {position.lng}
      </Popup>
    </Marker>
  ) : null;
}
  const [postOffices, setPostOffices] = useState([]);

  /* ================= VALIDATION ================= */

  const validate = () => {
    let err = {};

    if (!form.ownerName.trim()) err.ownerName = "Owner name required";

    if (!form.ownerEmail) err.ownerEmail = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(form.ownerEmail))
      err.ownerEmail = "Enter valid email";

    if (!form.ownerMobile || form.ownerMobile.length < 10)
      err.ownerMobile = "Valid mobile required";

    if (!form.ownerShopName) err.ownerShopName = "Shop name required";

    if (!form.ownerShopCertificate)
      err.ownerShopCertificate = "Shop certificate required";

    if (!form.shopFrontPhoto) err.shopFrontPhoto = "Shop front photo required";

    if (!form.shopInsidePhoto)
      err.shopInsidePhoto = "Shop inside photo required";

    if (!form.ownerShopStreet) err.ownerShopStreet = "Street required";
    if (!form.ownerLatitude || !form.ownerLongitude) {
      err.location = "Shop location required";
    }

    if (!form.ownerShopPincode || form.ownerShopPincode.length !== 6)
      err.ownerShopPincode = "Valid pincode required";

    if (!form.ownerShopBlock) err.ownerShopBlock = "Select village/block";

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  /* ================= GPS Handle ================== */
const handleGPS = () => {
  Swal.fire({
    title: "Enable Location Service?",
    text: "To use GPS, your browser needs permission to access your laptop's location.",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (!result.isConfirmed) return;

    if (!navigator.geolocation) {
      Swal.fire(
        "Not Supported",
        "Geolocation is not supported by your browser.",
        "error"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("GPS Latitude:", lat);
        console.log("GPS Longitude:", lng);

        // Save location
        setLocation({
          latitude: lat,
          longitude: lng,
        });

        // Save lat/lng
        setForm((prev) => ({
          ...prev,
          ownerLatitude: lat,
          ownerLongitude: lng,
        }));

        // Get address automatically
        await getAddressFromLocation(
          lat,
          lng,
          setForm,
          setPostOffices
        );

        // Close popup
        setShowPopup(false);

        Swal.fire({
          title: "Location Found!",
          text: "Location and address filled successfully.",
          icon: "success",
        });
      },

      (error) => {
        console.log("GPS Error:", error);

        Swal.fire({
          title: "Location Permission Required",
          text: "Please allow location access from your browser.",
          icon: "warning",
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
  /* ================= HANDLE CHANGE ================= */

const handleChange = async (e) => {
  const { name, value, files } = e.target;

  // Pincode me sirf numbers allow
  if (name === "ownerShopPincode" && !/^\d*$/.test(value)) {
  return;
}

  // Normal field update
  setForm((prev) => ({
    ...prev,
    [name]: files ? files[0] : value,
  }));

  // Error remove
  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));

  // =========================
  // PINCODE AUTO FILL
  // =========================

  if (name === "ownerShopPincode" && value.length === 6) {
    try {
      console.log("Searching Pincode:", value);

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${value}`
      );

      const data = await response.json();

      console.log("Pincode API Response:", data);

      if (
        data[0] &&
        data[0].Status === "Success" &&
        data[0].PostOffice
      ) {
        const offices = data[0].PostOffice;

        console.log("Post Offices:", offices);

        setPostOffices(offices);

        const first = offices[0];

        setForm((prev) => ({
          ...prev,

          ownerShopPincode: value,

          // First post office
          ownerShopBlock: first?.Name || "",

          // Block ko City me use kar rahe hain
          ownerShopCity: first?.Block || "",

          ownerShopDistrict: first?.District || "",

          ownerShopState: first?.State || "",
        }));

      } else {
        setPostOffices([]);

        setForm((prev) => ({
          ...prev,
          ownerShopBlock: "",
          ownerShopCity: "",
          ownerShopDistrict: "",
          ownerShopState: "",
        }));

        Swal.fire(
          "Invalid Pincode",
          "Please enter a valid Indian pincode.",
          "error"
        );
      }

    } catch (error) {
      console.error("Pincode API Error:", error);

      Swal.fire(
        "API Error",
        "Unable to fetch pincode details.",
        "error"
      );
    }
  }
};

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      Swal.fire("Validation Error", "Fix all fields", "error");
      return;
    }

    try {
      // OWNER OBJECT FOR CONSOLE
      const owner = {
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerMobile: form.ownerMobile,
        ownerShopName: form.ownerShopName,
        ownerShopStreet: form.ownerShopStreet,
        ownerShopPincode: form.ownerShopPincode,
        ownerShopCity: form.ownerShopCity,
        ownerShopBlock: form.ownerShopBlock,
        ownerShopDistrict: form.ownerShopDistrict,
        ownerShopState: form.ownerShopState,
      };

      console.log("Owner Data:", owner);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      if (loading) return;

      startLoading();

      const response = await fetch("http://localhost:5000/owner/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const ownerEmailReceived = data.ownerEmail;

      console.log("Response Email For OTP:", ownerEmailReceived);

      if (response.ok) {
        Swal.fire({
          title: "Registration Successful",
          text: "OTP Sent Successfully",
          icon: "success",
        }).then(() => {
          sessionStorage.removeItem("otpFlow");

          navigate("/ownerotpverify", {
            replace: true,
            state: { ownerEmail: ownerEmailReceived },
          });
        });
      } else {
        Swal.fire("Registration Failed", data.message || "Try again", "error");
      }
    } catch (error) {
      console.error(error);

      Swal.fire("Server Error", "Backend not responding", "error");
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <CommonLoader loading={loading} />

      <div className="form-wrapper">
        <FaTimes className="close-btn" onClick={() => navigate(-1)} />
        <h2>EliteSalon Owner Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <input
                  name="ownerName"
                  placeholder="Owner Name"
                  value={form.ownerName}
                  onChange={handleChange}
                />
                <small className="error-text">{errors.ownerName}</small>
              </div>

              <div className="form-group">
                <input
                  name="ownerEmail"
                  placeholder="Email"
                  value={form.ownerEmail}
                  onChange={handleChange}
                />
                <small className="error-text">{errors.ownerEmail}</small>
              </div>

              <div className="form-group">
                <PhoneInput
                  country="in"
                  value={form.ownerMobile}
                  onChange={(phone) => {
                    setForm((prev) => ({
                      ...prev,
                      ownerMobile: phone,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      ownerMobile: "",
                    }));
                  }}
                />

                <small className="error-text">{errors.ownerMobile}</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Shop Details</h3>

            <div className="form-grid ">
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  name="ownerShopName"
                  placeholder="Shop Name"
                  value={form.ownerShopName}
                  onChange={handleChange}
                />
                <small className="error-text">{errors.ownerShopName}</small>
              </div>

              <div className="form-group">
                <label>Shop Certificate</label>
                <input
                  type="file"
                  name="ownerShopCertificate"
                  onChange={handleChange}
                />
                <small className="error-text">
                  {errors.ownerShopCertificate}
                </small>
              </div>

              <div className="form-group">
                <label>Shop Front Photo</label>
                <input
                  type="file"
                  name="shopFrontPhoto"
                  onChange={handleChange}
                />
                <small className="error-text">{errors.shopFrontPhoto}</small>
              </div>

              <div className="form-group">
                <label>Shop Inside Photo</label>
                <input
                  type="file"
                  name="shopInsidePhoto"
                  onChange={handleChange}
                />
                <small className="error-text">{errors.shopInsidePhoto}</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Shop Address</h3>

            <div className="form-grid">
              {/* Street */}
              <div className="form-group" style={{ position: "relative" }}>
                <input
                  name="ownerShopStreet"
                  placeholder="Street"
                  value={form.ownerShopStreet}
                  onChange={handleChange}
                  onClick={() => setShowPopup(true)}
                />
                <small className="error-text">{errors.ownerShopStreet}</small>
                <small className="error-text">{errors.location}</small>

                {showPopup && (
                  <div className="location-popup">
                    <button type="button" onClick={handleGPS}>
                      📍 Use GPS
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPopup(false);
                        setShowMap(true);
                      }}
                    >
                      🗺 Choose Location
                    </button>
                  </div>
                )}

                <small className="error-text">{errors.ownerShopStreet}</small>
              </div>

              {/* Pincode */}
              <div className="form-group">
                <input
                  name="ownerShopPincode"
                  placeholder="Pincode"
                  maxLength="6"
                  value={form.ownerShopPincode}
                  onChange={handleChange}
                />
                <small className="error-text">{errors.ownerShopPincode}</small>
              </div>

              {/* Block */}
              <div className="form-group">
                <select
                  name="ownerShopBlock"
                  value={form.ownerShopBlock}
                  onChange={(e) => {
                    const selected = postOffices.find(
                      (po) => po.Name === e.target.value,
                    );

                    if (!selected) return;

                    setForm((prev) => ({
                      ...prev,
                      ownerShopBlock: selected.Name,
                      ownerShopCity: selected.Block,
                      ownerShopDistrict: selected.District,
                      ownerShopState: selected.State,
                    }));
                  }}
                >
                  <option value="">Select Village / Block</option>

                  {postOffices.map((po, index) => (
                    <option key={index} value={po.Name}>
                      {po.Name}
                    </option>
                  ))}
                </select>

                <small className="error-text">{errors.ownerShopBlock}</small>
              </div>

              <input value={form.ownerShopCity} readOnly />
              <input value={form.ownerShopDistrict} readOnly />
              <input value={form.ownerShopState} readOnly />
            </div>
          </div>

          <button className="submit-btn">
            {loading ? "Please wait..." : "Apply"}
          </button>
        </form>

        {/* ================= MAP MODAL ================= */}

        {showMap && (
          <div className="map-modal">
            <div className="map-container">
              <div className="map-header">
                <h3>Select Shop Location</h3>

                <button className="map-close" onClick={() => setShowMap(false)}>
                  ✕
                </button>
              </div>

              <div className="map-body">
                <MapContainer
                  center={[21.1702, 72.8311]}
                  zoom={13}
                  style={{ width: "100%", height: "100%" }}
                >
                 <TileLayer
                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                  <LocationMarker
                    locationIcon={locationIcon}
                    setForm={setForm}
                    setLocation={setLocation}
                    setPostOffices={setPostOffices}
                    setShowMap={setShowMap}
                  />
                </MapContainer>
              </div>

              <div className="map-footer">
                Click anywhere on the map to select your location.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerRegistration;
