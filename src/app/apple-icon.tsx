import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
          color: "#f8f5ee",
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -4,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: 28,
            border: "3px solid rgba(248, 245, 238, 0.22)",
          }}
        />
        <span>A</span>
      </div>
    ),
    size,
  );
}
