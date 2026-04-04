"use client";

import React, { useState, useEffect } from "react";

export default function DynamicBackground() {
  const [bgImage, setBgImage] = useState("/img/malam.png");

  useEffect(() => {
    const updateBg = () => {
      const now = new Date();
      const jam = now.getHours();
      const menit = now.getMinutes();
      const waktuDesimal = jam + menit / 60; 

      let img = "/img/malam.png"; // Default Malam

      if (waktuDesimal >= 5 && waktuDesimal < 11) {
        img = "/img/pagi.png";
      } else if (waktuDesimal >= 11 && waktuDesimal < 15.5) {
        img = "/img/siang.png";
      } else if (waktuDesimal >= 15.5 && waktuDesimal < 18.5) {
        img = "/img/sore.png";
      }

      setBgImage(img);
    };

    updateBg();
    const interval = setInterval(updateBg, 60000); // Perbarui setiap menit
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 -z-20 bg-fixed bg-cover bg-center transition-all duration-1000 ease-in-out pointer-events-none"
      style={{ backgroundImage: `url('${bgImage}')` }}
    />
  );
}
