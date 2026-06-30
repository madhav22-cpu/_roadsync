import React from "react";
import { T } from "../styles/tokens";

interface BlobHeaderProps {
  title: string;
  subtitle?: string;
}

export default function BlobHeader({ title, subtitle }: BlobHeaderProps) {
  return (
    <div
      style={{
        position: "relative",
        background: T.violet,
        borderRadius: "0 0 32px 32px",
        padding: "28px 20px 44px",
        overflow: "hidden",
        marginBottom: "-20px",
      }}
    >
      {/* Blob 1 */}
      <div
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: T.violetMid,
          opacity: 0.5,
          top: -60,
          right: -40,
          pointerEvents: "none",
        }}
      />
      {/* Blob 2 */}
      <div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: T.rose,
          opacity: 0.22,
          bottom: -30,
          left: 20,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: T.rose,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: T.rose,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            RoadSync · Greater Noida
          </span>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            lineHeight: 1.2,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}