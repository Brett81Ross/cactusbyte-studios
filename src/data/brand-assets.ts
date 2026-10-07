export type BrandAssetStatus = "verified" | "unresolved";

export type BrandAsset = {
  appId: string;
  name: string;
  src: string | null;
  status: BrandAssetStatus;
  source: string;
  sourcePath?: string;
  note?: string;
};

export const cactusByteBrand: BrandAsset = {
  appId: "cactusbyte-studios",
  name: "Cactus🌵Byte Studios™",
  src: "/logo2.png",
  status: "verified",
  source: "Brett81Ross/cactusbyte-studios",
  sourcePath: "public/logo2.png",
  note: "Current CactusByte app icon/metadata asset. Do not substitute AI-generated cactus marks."
};

export const brandAssets: Record<string, BrandAsset> = {
  noproblem: {
    appId: "noproblem",
    name: "SchismMatrix™",
    src: "https://noproblem-pws.vercel.app/assets/schismmatrix-symbol.svg",
    status: "verified",
    source: "Brett81Ross/noproblem.pws",
    sourcePath: "assets/schismmatrix-symbol.svg"
  },
  machzero: {
    appId: "machzero",
    name: "MachZero™",
    src: "https://machzero-beta.vercel.app/logo1.jpg",
    status: "verified",
    source: "Brett81Ross/machzero",
    sourcePath: "logo1.jpg"
  },
  "rapid-takeoff": {
    appId: "rapid-takeoff",
    name: "Rapid Takeoff™",
    src: "https://blueprint-estimator.vercel.app/icon.svg",
    status: "verified",
    source: "Brett81Ross/blueprint_estimator-",
    sourcePath: "app/icon.svg"
  },
  "acelynn-pro": {
    appId: "acelynn-pro",
    name: "Acelynn Pro™",
    src: "https://acelynn.vercel.app/acelynnpro.png",
    status: "verified",
    source: "Acelynn Pro production",
    sourcePath: "/acelynnpro.png",
    note: "Use the production Acelynn Pro mark. Do not substitute generated A marks."
  },
  pocketstomp: {
    appId: "pocketstomp",
    name: "PocketStomp™",
    src: null,
    status: "unresolved",
    source: "Brand recovery required",
    note: "The current production /pocketstomp-icon.png was explicitly rejected by the owner. Do not display it and do not invent a replacement."
  },
  ghostlane: {
    appId: "ghostlane",
    name: "GhostLane™",
    src: "https://ghostlane-app.vercel.app/logo-gl.png",
    status: "verified",
    source: "Brett81Ross/ghostlane-app",
    sourcePath: "logo-gl.png"
  },
  "first-bearing": {
    appId: "first-bearing",
    name: "First Bearing™",
    src: "https://first-bearing.vercel.app/first-bearing-app-icon-512-v260.png",
    status: "verified",
    source: "Brett81Ross/first-bearing",
    sourcePath: "first-bearing-app-icon-512-v260.png"
  },
  "fantasy-matrix": {
    appId: "fantasy-matrix",
    name: "Fantasy Football Matrix™",
    src: "/ffm-mark.svg",
    status: "verified",
    source: "Brett81Ross/fantasy-football-selector-matrix",
    sourcePath: "icons/ffm-mark.svg"
  },
  scouttrace: {
    appId: "scouttrace",
    name: "Acelynn’s ScoutTrace™",
    src: "https://acelynn-scoutrace.vercel.app/scouttrace-icon.svg",
    status: "verified",
    source: "Brett81Ross/acelynn_scoutrace",
    sourcePath: "scouttrace-icon.svg"
  },
  "shadownex-prime": {
    appId: "shadownex-prime",
    name: "ShadowNex Prime™",
    src: "/shadownex-mark.webp",
    status: "verified",
    source: "Brett81Ross/shadownex-prime",
    sourcePath: "brand/shadownex-mark.webp"
  },
  "terraflow-matrix": {
    appId: "terraflow-matrix",
    name: "TerraFlow Matrix™",
    src: "https://terraflow-matrix.vercel.app/assets/terraflow-icon.svg",
    status: "verified",
    source: "Brett81Ross/terraflow-matrix",
    sourcePath: "assets/terraflow-icon.svg"
  },
  "hustle-first": {
    appId: "hustle-first",
    name: "Hustle First™",
    src: "https://hustle-first.vercel.app/hf-logo-mark.svg",
    status: "verified",
    source: "Brett81Ross/hustle-first",
    sourcePath: "public/hf-logo-mark.svg",
    note: "Use the approved HF production mark."
  },
  orbitgather: {
    appId: "orbitgather",
    name: "OrbitGather™",
    src: "/orbitgather-mark.svg",
    status: "verified",
    source: "Brett81Ross/orbitgather",
    sourcePath: "public/favicon.svg"
  },
  rivetex: {
    appId: "rivetex",
    name: "RIVETEX™",
    src: "https://rivetex.cactusbytestudios.com/assets/rivetex-app.webp",
    status: "verified",
    source: "Brett81Ross/rivetex",
    sourcePath: "assets/rivetex-app.webp"
  }
};

export const verifiedBrandAsset = (appId: string) => {
  const asset = brandAssets[appId];
  return asset?.status === "verified" && asset.src ? asset : null;
};
