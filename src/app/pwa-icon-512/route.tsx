import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// ImageResponse needs local image bytes, not a self-fetch using request.url.
// In private Codespaces the incoming URL may be 0.0.0.0, which cannot be fetched.
// The PNG is the existing official CactusByte mark, never a generated substitute.
export const runtime = "nodejs";

export async function GET() {
  const png = await readFile(join(process.cwd(), "public/logo2.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;
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
          padding: 46,
        }}
      >
        <img
          src={src}
          alt=""
          width={420}
          height={420}
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
