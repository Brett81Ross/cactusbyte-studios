import fs from 'node:fs';
const abl=fs.readFileSync('ATOMIC_BUILD_LIST.md','utf8');
const vercel=fs.readFileSync('vercel.json','utf8');
function must(needle,label){if(!abl.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}
must('591ae98737a30d7682c1ed70490b8202f0861390','chronology recovery commit');
must('33579219696','canonical browser recovery run');
must('6363059183cebe650830cc240d275936dc802d34','service-worker retirement commit');
must('33579219674','canonical source recovery run');
must('33579130485','service-worker deterministic settle run');
must('- [ ] Complete the physical Android legacy export → clean-install restore/merge round trip','physical Android gate remains open');
if(abl.includes('- [x] Complete the physical Android legacy export → clean-install restore/merge round trip'))throw new Error('Physical Android recovery must not be marked complete.');
if(!/"deploymentEnabled"\s*:\s*false/.test(vercel))throw new Error('Vercel deployment gate must remain disabled.');
console.log('Acelynn Pro Phase 7 recovery record QA passed.');
