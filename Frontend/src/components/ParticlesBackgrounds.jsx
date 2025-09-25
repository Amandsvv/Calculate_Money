// src/components/SpringBackground.jsx
import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";

export default function SpringBackground() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const animation = useSpring({
    transform: `translate(${coords.x / 50}px, ${coords.y / 50}px)`,
    config: { tension: 100, friction: 20 },
  });

  const handleMouseMove = (e) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="spring-bg"
      onMouseMove={handleMouseMove}
    >
      {/* Animated blob */}
      <animated.div
        style={{
          ...animation,
          width: 400,
          height: 400,
          borderRadius: "50%",
          position: "absolute",
          top: "20%",
          left: "30%",
          background: "radial-gradient(circle at center, #ff6ec7, #734ae8)",
          opacity: 0.4,
          filter: "blur(80px)",
        }}
      />
      {/* Second blob */}
      <animated.div
        style={{
          ...animation,
          width: 300,
          height: 300,
          borderRadius: "50%",
          position: "absolute",
          bottom: "15%",
          right: "25%",
          background: "radial-gradient(circle at center, #23d5ab, #23a6d5)",
          opacity: 0.4,
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
