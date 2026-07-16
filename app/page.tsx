import type { Metadata } from "next";
import { MorsLightExperience } from "./MorsLightExperience";

export const metadata: Metadata = {
  title: "菠萝包 & さと",
  description: "菠萝包和さと的侦探搭档灯光互动页面。",
};

export default function Home() {
  return <MorsLightExperience />;
}
