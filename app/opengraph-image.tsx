import { ImageResponse } from "next/og";

export const alt = "MyWCSA GovApps – People, Services, Progress";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "76px 86px",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        background: "linear-gradient(135deg, #001484 0%, #071f5b 65%, #052447 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "#ffffff",
            color: "#001484",
            fontSize: 36,
            fontWeight: 800,
          }}
        >G</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontSize: 20, letterSpacing: 2, fontWeight: 700 }}>WESTERN CAPE SPORTS ASSOCIATION NPC</div>
          <div style={{ fontSize: 16, color: "#cbdcff" }}>People | Services | Progress</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
          <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: -3 }}>MyWCSA</div>
          <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: -3, color: "#8ed2ff" }}>GovApps</div>
        </div>
        <div style={{ fontSize: 27, color: "#e7f0ff" }}>
          Your secure gateway to digital services
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ fontSize: 21, color: "#aabff0" }}>govapps.wcsports.co.za</div>
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ width: 56, height: 8, borderRadius: 4, background: "#ffcd00" }} />
          <div style={{ width: 56, height: 8, borderRadius: 4, background: "#ee2367" }} />
          <div style={{ width: 56, height: 8, borderRadius: 4, background: "#37acd8" }} />
        </div>
      </div>
    </div>,
    { ...size },
  );
}
