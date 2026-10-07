"use client";

import {usePathname} from "next/navigation";
import AccountDock from "./account-dock";
import BrandedShare from "./branded-share";
import CactusByteAuthSurface from "./cactusbyte-auth-surface";
import DemoHelp from "./demo-help";
import LaunchBar from "./launch-bar";
import PersonalizationLayer from "./personalization-layer";
import SecureCheckoutBridge from "./secure-checkout-bridge";
import TesterAppBridge from "./tester-app-bridge";

export default function GlobalChrome(){
  const pathname=usePathname();
  if(pathname==="/"||pathname==="/acelynn-beta"||pathname==="/acelynn-beta/"||pathname==="/storefront"||pathname==="/storefront/") return null;
  return <><LaunchBar/><BrandedShare/><CactusByteAuthSurface/><PersonalizationLayer/><TesterAppBridge/><SecureCheckoutBridge/><AccountDock/><DemoHelp/></>;
}
