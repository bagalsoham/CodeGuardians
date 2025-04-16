import React from 'react';

function Benefits() {
    const benefitItems = [
        {
            title: "Reduced manual effort",
            bgColor: "var(--accent-fuschia-tint)",
            textColor: "var(--primary-color)"
        },
        {
            title: "Minimized human biases",
            bgColor: "var(--accent-cobalt-tint)",
            textColor: "var(--primary-color)"
        },
        {
            title: "Improved governance and transparency",
            bgColor: "var(--primary-tint-25)",
            textColor: "var(--primary-color)"
        },
        {
            title: "Scalable for integration with SMART",
            bgColor: "var(--accent-iron-tint)",
            textColor: "var(--primary-color)"
        }
    ];

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4" style={{ fontFamily: "Effra-Reg", color: "#37377D", fontWeight: "bold" }}>
                Benefits
            </h1>
            
            <div className="row g-4">
                {benefitItems.map((item, index) => (
                    <div className="col-md-6 col-lg-3" key={index}>
                        <div 
                            style={{ 
                                position: "relative",
                                backgroundColor: item.bgColor,
                                height: "160px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 2rem",
                                overflow: "hidden"
                            }}
                        >
                            {/* Content */}
                            <h3 
                                className="m-0" 
                                style={{ 
                                    color: item.textColor,
                                    fontFamily: "Effra-Reg",
                                    fontWeight: "500",
                                    fontSize: "1.1rem",
                                    position: "relative",
                                    zIndex: 1
                                }}
                            >
                                {item.title}
                            </h3>
                            
                            {/* Angled shape using clipPath */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "50%",
                                height: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                                clipPath: "polygon(100% 0, 50% 0, 100% 100%)"
                            }}></div>
                            
                            {/* Arrow icon */}
                            <div style={{
                                position: "absolute",
                                right: "20px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: item.textColor,
                                fontSize: "1.5rem",
                                zIndex: 2
                            }}>
                                <span>&#8250;</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Benefits;