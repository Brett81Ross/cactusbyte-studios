import fs from 'node:fs'

const read = path => fs.readFileSync(path, 'utf8')
const helper = read('src/lib/rapid-takeoff-recovery.ts')
const issue = read('src/app/api/rapid-takeoff/recovery/issue/route.ts')
const confirm = read('src/app/api/rapid-takeoff/recovery/confirm-claim/route.ts')
const consume = read('src/app/api/rapid-takeoff/recovery/consume-restore/route.ts')
const page = read('src/app/rapid-takeoff-recovery/page.tsx')
const coupon = read('src/app/api/coupons/rapid-takeoff/issue/route.ts')
const vercel = read('vercel.json')

function must(condition, message) {
  if (!condition) throw new Error(message)
}

must(issue.includes('testerIdentity(request)'), 'recovery issue must require authenticated CactusByte ID')
must(issue.includes('purpose!=="claim"&&purpose!=="restore"'), 'recovery purpose allowlist missing')
must(helper.includes('RATE_LIMIT_MS') && helper.includes('RATE_LIMITED'), 'per-ID issue throttling missing')
must(helper.includes('randomBytes(32).toString("base64url")'), 'cryptographically random recovery token missing')
must(helper.includes('rapidTakeoffRecoveryTokens') && helper.includes('rapidRecoveryTokenHash(token)'), 'raw recovery token must not be stored as document ID')
must(helper.includes('RAPID_RECOVERY_BRIDGE_SECRET'), 'shared server claim secret missing')
must(helper.includes('timingSafeEqual'), 'claim attestation constant-time comparison missing')
const attestationGuard = confirm.indexOf('if(!validRapidRecoveryToken(token)||!verifyRapidClaimAttestation(token,attestation))')
const claimGrant = confirm.indexOf('await confirmRapidLegacyClaim(token)')
must(attestationGuard >= 0 && claimGrant > attestationGuard, 'HMAC attestation must be verified before legacy claim grant')
must(helper.includes('source:"legacy_cookie_claim"') && helper.includes('status:"lifetime"') && helper.includes('plan:"lifetime"'), 'legacy cookie claim must create explicit lifetime entitlement')
must(helper.includes('rapidTakeoffRecoveryEvents') && helper.includes('action:"legacy_cookie_claim"') && helper.includes('action:"restore"'), 'claim/restore audit trail missing')
must(helper.includes('NO_LIFETIME_ENTITLEMENT'), 'restore lifetime entitlement guard missing')
must(consume.includes('consumeRapidRestoreToken'), 'restore token consumption route missing')
must(page.includes('Link Current Pro to This ID') && page.includes('Restore My Pro Access'), 'CactusByte recovery UI actions missing')
must(page.includes('same Rapid Takeoff app/WebView'), 'legacy-cookie same-WebView warning missing')
must(coupon.includes('COUPON_ALREADY_REDEEMED'), 'existing one-time coupon protection changed unexpectedly')
must(!confirm.includes('rapid-takeoff/issue') && !consume.includes('rapid-takeoff/issue'), 'recovery must not call coupon issuance')
must(vercel.includes('"deploymentEnabled":false'), 'Git auto-deployment must remain disabled')

console.log('CactusByte Rapid Takeoff recovery authority QA: PASS')
