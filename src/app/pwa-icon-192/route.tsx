import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const logoUrl = new URL("/logo2.png", request.url);
  const logoResponse = await fetch(logoUrl);
  if (!logoResponse.ok) {
    return new Response("CactusByte logo unavailable", { status: 502 });
  }
  const logoData = await logoResponse.arrayBuffer();

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
          padding: "17px",
        }}
      >
        <img
          src={logoData as unknown as string}
          alt=""
          width="157"
          height="157"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      width: 192,
      height: 192,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    },
  );
}
