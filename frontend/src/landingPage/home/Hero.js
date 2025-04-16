import React from 'react';

function Hero() {
    return (
        <div className="hero-banner py-5" style={{
            backgroundColor: "#E6E9F0", 
            backgroundImage: "linear-gradient(to right bottom, #E6E9F0, #D8DDE8)",
            position: "relative",
            overflow: "hidden"
        }}>
            <div className="container py-4">
                <h1 style={{
                    fontFamily: "Effra-Reg", /* Apply Effra-Reg */
                    color: "#283677", 
                    fontWeight: "bold",
                    fontSize: "2.5rem",
                    maxWidth: "800px"
                }}>
                    Automated Evaluation of Performance Agreements
                </h1>
            </div>
            <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "25%",
                height: "100%",
                backgroundColor: "#ffffff",
                clipPath: "polygon(100% 0, 50% 0, 100% 100%)"
            }}></div>
        </div>
    );
}

export default Hero;
