import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function AboutPage() {
  return (
    <div className="container mt-5 mb-5" style={{ fontFamily: "Effra-Reg" }}>
      {/* Header with Notch Design */}
      <div
        className="text-white px-4 py-2 fw-bold"
        style={{
          backgroundColor: "#2e3192",
          display: "inline-block",
          fontSize: "1.8rem",
          clipPath: "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)",
          fontFamily: "Effra-Reg",
        }}
      >
        About US
      </div>

      {/* Content Box with Diagonal Cut */}
      <div
        className="p-4 mt-2"
        style={{
          backgroundColor: "#d9dbe3",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)",
          maxWidth: "900px",
          color: "#37377D", // Updated text color
          fontFamily: "Effra-Reg",
          fontSize:"1.2rem"
        }}
      >
        <p>
          The Commonwealth is a voluntary association of{" "}
          <u>56 independent and equal countries</u>.
        </p>

        <p>
          It is home to 2.7 billion people, and includes both advanced economies
          and developing countries. 33 of our members are small states,
          including many island nations.
        </p>

        <p>
          Our member governments have agreed to shared goals like development,
          democracy and peace. Our values and principles are expressed in the{" "}
          <u>Commonwealth Charter</u>.
        </p>

        <p>
          The Commonwealth's roots go back to the British Empire. But today{" "}
          <u>any country can join</u> the modern Commonwealth. The last two
          countries to join the Commonwealth were Gabon and Togo in 2022.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
