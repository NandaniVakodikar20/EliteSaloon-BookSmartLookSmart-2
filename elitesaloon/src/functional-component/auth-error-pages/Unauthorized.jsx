import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            textAlign: "center",
            color: "white"
        }}>
            <h1>401</h1>

            <h2>Unauthorized</h2>

            <p>
                You must be logged in to access this page.
            </p>

            <button onClick={() => navigate("/customerlogin")}>
                Go to Login
            </button>
        </div>
    );
};

export default Unauthorized;