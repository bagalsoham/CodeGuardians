import React from "react";

function RightSection({
  imageUrl,
  productName,
  productDescription,
}) {
  return (
    <div className="container d-flex mb-5 align-items-center">
      <div className="row w-100">
        {/* Text Section */}
        <div className="col-6 d-flex flex-column justify-content-center p-5">
          <h1 style={{ fontFamily: "Effra-Reg", color: "#37377D", fontWeight: "bold" }}>
            {productName}
          </h1>
          <p style={{ fontFamily: "Effra-Reg", color: "rgba(55, 55, 125, 0.50)", fontSize: "1.2rem" }}>
            {productDescription}
          </p>

        </div>
        {/* Image Section */}
        <div className="col-6 d-flex justify-content-center align-items-center">
          <div
            className="border rounded-3 p-4 d-flex justify-content-center align-items-center"
            style={{ width: "75%", height: "auto" }}
          >
            <img
              src={imageUrl}
              className="img-fluid"
              style={{ maxWidth: "60%" }} // Reduced the size
              alt="Product"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSection;
