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
  const getAddressFromLocation = async (lat, lng) => {
    try {
      console.log("Getting address...");
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch address");
      }

      const data = await response.json();

      console.log("Address Data:", data);

      const address = data.address || {};

      // Street / Shop Address
      const street =
        address.road ||
        address.residential ||
        address.neighbourhood ||
        address.suburb ||
        "";

      // Pincode
      const pincode = address.postcode || "";

      // City
      const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.state_district ||
        "";

      // Block / Taluka
      const block =
        address.county ||
        "";

      // District
      const district =
        address.state_district ||
        address.district ||
        "";

      // State
      const state =
        address.state ||
        "";

      console.log("Street:", street);
      console.log("Pincode:", pincode);
      console.log("City:", city);
      console.log("Block/Taluka:", block);
      console.log("District:", district);
      console.log("State:", state);

      setForm((prev) => ({
        ...prev,
        ownerLatitude: lat,
        ownerLongitude: lng,
        ownerShopStreet: street,
        ownerShopPincode: pincode,
        ownerShopCity: city,
        ownerShopBlock: block,
        ownerShopDistrict: district,
        ownerShopState: state,
      }));

      setErrors((prev) => ({
        ...prev,
        location: "",
        ownerShopBlock: "",
      }));

    } catch (error) {
      console.error("Reverse geocoding error:", error);

      setErrors((prev) => ({
        ...prev,
        location: "Unable to get address from selected location.",
      }));
    }
  };
  function LocationMarker({
    locationIcon,
    setForm,
    setLocation,
    setShowMap,
    getAddressFromLocation,
  }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;

        console.log("MAP CLICKED");
        console.log("Latitude:", lat);
        console.log("Longitude:", lng);

        // Show marker
        setPosition(e.latlng);

        // Save coordinates
        setLocation({
          latitude: lat,
          longitude: lng,
        });

        // Get address and fill form
        await getAddressFromLocation(lat, lng);

        // Close map after location is selected
        setShowMap(false);
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
  // const [postOffices, setPostOffices] = useState([]);

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

    if (!form.ownerShopBlock) {
      err.ownerShopBlock = "Block / Taluka required";
    }

    if (!form.ownerShopCity) {
      err.ownerShopCity = "City required";
    }

    if (!form.ownerShopDistrict) {
      err.ownerShopDistrict = "District required";
    }

    if (!form.ownerShopState) {
      err.ownerShopState = "State required";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  /* ================= GPS Handle ================== */
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        location: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("GPS Latitude:", latitude);
        console.log("GPS Longitude:", longitude);

        setLocation([latitude, longitude]);
        setShowPopup(false);

        await getAddressFromLocation(latitude, longitude);
      },
      (error) => {
        console.error("GPS Error:", error);

        setErrors((prev) => ({
          ...prev,
          location: "Unable to get your current location.",
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Pincode: only numbers
    if (name === "ownerShopPincode" && !/^\d*$/.test(value)) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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

          `

          <div className="form-section">
            <h3>Shop Address</h3>

            <div className="form-grid">

              {/* Street / Shop Address */}
              <div
                className="form-group"
                style={{ position: "relative" }}
              >
                <label>Street / Shop Address</label>

                <input
                  type="text"
                  name="ownerShopStreet"
                  placeholder="Enter street / shop address"
                  value={form.ownerShopStreet}
                  onChange={handleChange}
                  onClick={() => setShowPopup(true)}
                />

                {showPopup && (
                  <div className="location-popup">
                    <button
                      type="button"
                      onClick={handleGPS}
                    >
                      📍 Use Current Location
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

                <small className="error-text">
                  {errors.ownerShopStreet}
                </small>

                <small className="error-text">
                  {errors.location}
                </small>
              </div>


              {/* Pincode */}
              <div className="form-group">
                <label>Pincode</label>

                <input
                  type="text"
                  name="ownerShopPincode"
                  placeholder="Enter pincode"
                  value={form.ownerShopPincode}
                  onChange={handleChange}
                  maxLength="6"
                />

                <small className="error-text">
                  {errors.ownerShopPincode}
                </small>
              </div>


              {/* City */}
              <div className="form-group">
                <label>City</label>

                <input
                  type="text"
                  name="ownerShopCity"
                  placeholder="City"
                  value={form.ownerShopCity}
                  readOnly
                />

                <small className="error-text">
                  {errors.ownerShopCity}
                </small>
              </div>


              {/* Block / Taluka */}
              <div className="form-group">
                <label>Block / Taluka</label>

                <input
                  type="text"
                  name="ownerShopBlock"
                  placeholder="Block / Taluka"
                  value={form.ownerShopBlock}
                  readOnly
                />

                <small className="error-text">
                  {errors.ownerShopBlock}
                </small>
              </div>


              {/* District */}
              <div className="form-group">
                <label>District</label>

                <input
                  type="text"
                  name="ownerShopDistrict"
                  placeholder="District"
                  value={form.ownerShopDistrict}
                  readOnly
                />

                <small className="error-text">
                  {errors.ownerShopDistrict}
                </small>
              </div>


              {/* State */}
              <div className="form-group">
                <label>State</label>

                <input
                  type="text"
                  name="ownerShopState"
                  placeholder="State"
                  value={form.ownerShopState}
                  readOnly
                />

                <small className="error-text">
                  {errors.ownerShopState}
                </small>
              </div>

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
                    setShowMap={setShowMap}
                    getAddressFromLocation={getAddressFromLocation}
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
