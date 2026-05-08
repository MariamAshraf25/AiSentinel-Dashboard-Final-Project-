import React from 'react';
import Particles from "@tsparticles/react";

const BackgroundPatterns = ({ init }) => {
  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={(container) => {
          console.log("Particles Loaded!", container); 
      }}
      className="absolute inset-0 z-0 pointer-events-none"
      options={{
            fullScreen: { enable: false },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" }, 
              },
              modes: {
                grab: { distance: 200, links: { opacity: 0.6 } },
              },
            },
            particles: {
              color: { value: "#3b82f6" }, 
              links: {
                color: "#3b82f6",
                distance: 250, 
                enable: true,
                opacity: 0.5,  
                width: 1,     
              },
              move: {
                enable: true,
                speed: 1.0,    
                direction: "none",
                outModes: { default: "bounce" }, 
              },
              number: {
                density: { enable: true, area: 800 },
                value: 100,      
              },
              opacity: {
                value: 0.7,   
              },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
      }}
    />
  );
};

export default BackgroundPatterns;