// Exact checksum gate for the user-approved SLB13 artwork package.
// No image generation; verifies original, visually approved compositions
// have been copied to the draft Codespaces worktree, never to Vercel.
import fs from "node:fs";
import {createHash} from "node:crypto";
const artwork={
  "acelynn-pro": "3c66e618cbc8cd49595b1720b7edfdaa57b2194e112d3a22a4709005e538037b",
  "first-bearing": "061cde38e6c2e34ef29d47d6fba56df09ab87758404b4e8f2f200d9a7efef7b2",
  "fantasy-matrix": "422b6ebfe97b46d0ba9ce44221d4d1e645df3a3c18d82ef1c3d6bb326d529739",
  "noproblem": "f110bb64636d5cdfe5cecc61fae4de3c88d58e956f7b6787be0016a85ded301e",
  "shadownex-prime": "7ba59b0317c850574307b748a4b00c1399e6cdc445e4d2ea0e3ed787a6add9fb",
  "scouttrace": "7ccd627c550071fa0c4fb1c5678349d11a8f53e71850562a413bb6a759c71c03",
  "rapid-takeoff": "40c9ddb590e7e3dbe3c7d9032123554fc32eba517174a0d72a4d9cb117089d12",
  "hustle-first": "bb89d26f262867751e30ec533955e93fad2c1642c9becb95ee7d26f34f08bf32",
  "machzero": "93e07604cb2c5ab53bdbb94dd37e9d1248797ef624bbd027945ea6c896304dcd",
  "pocketstomp": "da47c9f64e94e88572df5795e5cb14e09caf22a4521557d51f09ac8e79bf2017",
  "ghostlane": "53c0257621290a796d56bcae821af4389d28b15df638e3501773ab4ecd4e067f",
  "terraflow-matrix": "8757657b7ad0b89cf08db451e2ffb2f704c7728b690e9d4bfaf9efad42dce005",
  "rivetex": "e48c04a092fb3d605f177f37474dbbc6655b131c329f6395607d5599141834d5"
};
const check=(path,expected)=>{
 if(!fs.existsSync(path)){console.error("MISSING",path);return false}
 const b=fs.readFileSync(path);
 const hash=createHash("sha256").update(b).digest("hex");
 const pass=hash===expected&&b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP";
 console.log((pass?"PASS":"FAIL")+" "+path+(pass?"":" checksum or WebP signature mismatch"));
 return pass;
};
let passes=0;
for(const [id,sha] of Object.entries(artwork)){
 if(check("public/cinematic/"+id+".webp",sha))passes++;
}
const icon="public/brand/orbitgather-approved.png";
if(fs.existsSync(icon)&&createHash("sha256").update(fs.readFileSync(icon)).digest("hex")==="78c892630aac6177c112a4113b91a57243efd3aec8dd596b32d5ab71b451b5f5"){passes++;console.log("PASS provisional OrbitGather approved logo")}else console.error("MISSING or modified provisional OrbitGather logo");
const proposal="public/cinematic/orbitgather.webp";
if(fs.existsSync(proposal)){console.error("BLOCKED: OrbitGather poster not approved yet:",proposal);process.exitCode=1}
console.log("Approved artwork integrity: "+passes+"/14");
if(passes!==14)process.exitCode=1;
