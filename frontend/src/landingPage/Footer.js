import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

function Footer() {
    return (
        <footer style={{ backgroundColor: "#E6E9F5", padding: "2rem 0" }}>
            <div className="container text-center">
                {/* Social Media Section */}
                <h1 style={{ fontFamily: "Effra-Reg", color: "#37377D", fontWeight: "bold" }}>
                    Join the conversation
                </h1>
                <div className="d-flex justify-content-center gap-3 my-3">
                    <FaFacebookF size={30} color="#C73678" />
                    <FaInstagram size={30} color="#C73678" />
                    <FaLinkedinIn size={30} color="#C73678" />
                    <FaYoutube size={30} color="#C73678" />
                </div>

                {/* Footer Content Section */}
                <div className="d-flex justify-content-between align-items-center flex-wrap p-3">
                    {/* Logo and Name */}
                    <div className="d-flex align-items-center me-5">
                        <img
                            src="/assets/images/logo.png"
                            alt="Logo"
                            style={{ height: "50px", marginRight: "15px" }}
                        />
                    </div>

                    {/* Links Section */}
                    <div className="d-flex gap-4 ms-auto">
                        <div className="d-flex flex-column">
                            <a href="#" style={updatedLinkStyle}>Accounts and internal reports</a>
                            <a href="#" style={updatedLinkStyle}>Cookie policy</a>
                            <a href="#" style={updatedLinkStyle}>Cookie settings</a>
                            <a href="#" style={updatedLinkStyle}>Privacy</a>
                        </div>
                        <div className="d-flex flex-column">
                            <a href="#" style={updatedLinkStyle}>Terms & Conditions</a>
                            <a href="#" style={updatedLinkStyle}>Work with us</a>
                            <a href="#" style={updatedLinkStyle}>Contact us</a>
                        </div>
                    </div>
                </div>

            <h3 style={{ fontFamily: "Effra-Reg", color: "#37377D",}}>Copyright © 2025 Commonwealth Secretariat</h3>
            </div>
        </footer>
    );
}

// Footer Link Styles
const updatedLinkStyle = {
    fontSize: "1.1rem",  // Increased font size
    fontWeight: "500",   // Slightly bolder text
    color: "#37377D",    // Ensure proper contrast
    textDecoration: "none",
};



export default Footer;
