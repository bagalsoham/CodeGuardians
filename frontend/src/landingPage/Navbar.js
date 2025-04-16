import React from "react";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        {/* Logo Section */}
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src="/assets/images/logo.png"
            alt="Logo"
            style={{ height: "50px", marginRight: "15px" }}
          />
        </a>

        {/* Navbar Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Items */}
        <div 
          className="collapse navbar-collapse justify-content-center" 
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav" style={{ fontSize: "1.2rem", fontWeight: "400" }}>
            {["Home", "Dashboard", "About", "Logout"].map((item, index) => (
              <li className="nav-item mx-5" key={index}>
                <a 
                  className="nav-link nav-hover" 
                  href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "")}`} 
                  style={{ fontFamily: "Effra-Reg", color: "#37377D" }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
