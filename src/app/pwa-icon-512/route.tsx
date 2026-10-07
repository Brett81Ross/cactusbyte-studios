import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const logoUrl = new URL("/logo2.png", request.url).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050807",
          padding: "46px",
        }}
      >
        <img
          src={logoUrl}
          alt=""
          width="420"
          height="420"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    },
  );
}
