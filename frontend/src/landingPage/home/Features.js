import React from 'react';
import Hero from './Hero';
import LeftSection from './LeftSide';
import RightSection from './RightSide';

function Features() {
    return (

        <>
            <h1 className="text-center mb-4" style={{ fontFamily: "Effra-Reg", color: "#37377D", fontWeight: "bold" }}>
                Features
            </h1>
            <LeftSection
                imageUrl="/assets/images/gapp.png"
                productName="GAPP Compliance Analysis"
                productDescription="Analyzing the performance agreement using the Generally Accepted Performance Principles "

            />
            <RightSection
                imageUrl="/assets/images/performance.png"
                productName="Performance Agreement Upload"
                productDescription="Upload document of type PDF, Word upto size 10mb."
            />
            <LeftSection
                imageUrl="/assets/images/colaboration.png"
                productName="Redundancy Detection and Collaboration Suggestions"
                productDescription=" Analysis of multiple CFRs to highlight overlapping goals and opportunities for inter-departmental collaboration."
                tryDemo="Coin"
            />
            <RightSection
                imageUrl="/assets/images/vision.png"
                productName="Vision-Objective-Action Alignment"
                productDescription="Outlines how misalignments are detected between vision, objectives, and actions."
            />

            {/* <p className="text-center mb-5 fs-5">
                Want to know more about our technology stack? Check out the{" "}
                <a href="" style={{ color: "blue" }}>Zerodha.tech</a> blog
            </p> */}
        </>
    );
}

export default Features;
