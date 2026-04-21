import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #345c49 0%, #223c30 100%)",
          color: "#f8f5ee",
          fontSize: 208,
          fontWeight: 700,
          letterSpacing: -10,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: 104,
            border: "6px solid rgba(248, 245, 238, 0.22)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span>A</span>
          <span
            style={{
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: 8,
              textTransform: "uppercase",
              opacity: 0.92,
            }}
          >
            collect
          </span>
        </div>
      </div>
    ),
    size,
  );
}
