import fs from "node:fs";

const path="src/app/page.tsx";
let s=fs.readFileSync(path,"utf8");

const replacements=[
 [
  '<button onClick={()=>setAuth(!auth)}>{id.user?"CactusByte ID":"Sign In"}</button>',
  '<button disabled={id.busy&&!id.user} onClick={()=>{if(!id.busy)setAuth(!auth)}}>{id.user?"CactusByte ID":id.busy?"Restoring ID…":"Sign In"}</button>'
 ],
 [
  '{auth&&<Auth id={id}/>}<section className="identity"><b>{id.user?(id.profile?.displayName||id.user.email):"Not signed in"}</b><span>{id.user?`Role: ${id.profile?.role||"user"} · ${activeProCount} Pro active`:"Cloud features and linked Pro access require CactusByte ID™"}</span></section>',
  '{auth&&!id.busy&&<Auth id={id}/>}<section className="identity"><b>{id.user?(id.profile?.displayName||id.user.email):id.busy?"Restoring CactusByte ID…":"Not signed in"}</b><span>{id.user?`Role: ${id.profile?.role||"user"} · ${activeProCount} Pro active`:id.busy?"Checking trusted owner access…":"Cloud features and linked Pro access require CactusByte ID™"}</span></section>'
 ],
 [
  '<State n="Pro Access" s={id.user?"Connected":"Sign-in"}/>',
  '<State n="Pro Access" s={id.user?"Connected":id.busy?"Checking":"Sign-in"}/>'
 ],
 [
  '<State n="Community" s={id.user?"Connected":"Sign-in"}/>',
  '<State n="Community" s={id.user?"Connected":id.busy?"Checking":"Sign-in"}/>'
 ]
];

for(const [from,to] of replacements){
 if(!s.includes(from))throw new Error(`Expected auth UX pattern not found: ${from.slice(0,80)}`);
 s=s.replace(from,to);
}
fs.writeFileSync(path,s);
console.log("Applied CactusByte auth restoration UX hotfix.");
