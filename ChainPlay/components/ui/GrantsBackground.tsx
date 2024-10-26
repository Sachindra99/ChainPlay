import React from "react";

export default function GrantsBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="grad1"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "rgb(0, 255, 255)", stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "rgb(0, 128, 128)", stopOpacity: 0 }}
            />
          </radialGradient>
          <radialGradient
            id="grad2"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "rgb(0, 255, 0)", stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "rgb(0, 128, 0)", stopOpacity: 0 }}
            />
          </radialGradient>
        </defs>

        {[...Array(20)].map((_, i) => (
          <circle
            key={`c1-${i}`}
            className="animate-float"
            cx={Math.random() * 100 + "%"}
            cy={Math.random() * 100 + "%"}
            r={Math.random() * 50 + 10}
            fill="url(#grad1)"
            style={{ animationDelay: `${Math.random() * 5}s` }}
          />
        ))}

        {[...Array(20)].map((_, i) => (
          <circle
            key={`c2-${i}`}
            className="animate-float"
            cx={Math.random() * 100 + "%"}
            cy={Math.random() * 100 + "%"}
            r={Math.random() * 50 + 10}
            fill="url(#grad2)"
            style={{ animationDelay: `${Math.random() * 5}s` }}
          />
        ))}
      </svg>

      <div className="relative z-10 flex space-x-4 space-y-2 h-full">
        {children}
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translate(
              ${Math.random() > 0.5 ? "" : "-"}${Math.random() * 200}px,
              ${Math.random() > 0.5 ? "" : "-"}${Math.random() * 200}px
            );
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 15s infinite;
        }
      `}</style>
    </div>
  );
}
