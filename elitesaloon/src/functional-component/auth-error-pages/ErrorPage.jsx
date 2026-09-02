import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {

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
            <h1>500</h1>

            <h2>Something went wrong</h2>

            <p>
                We couldn't load your dashboard.
                Please try again later.
            </p>

            <button onClick={() => navigate("/customerlogin")}>
                Back to Login
            </button>
        </div>
    );
};

export default ErrorPage;