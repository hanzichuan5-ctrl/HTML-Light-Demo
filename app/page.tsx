import type { Metadata } from "next";
import { MorsLightExperience } from "./MorsLightExperience";

export const metadata: Metadata = {
  title: "HZC — 我是鼠鼠大王",
  description:
    "A small, elegant, high-performance Rust game engine architecture built around Space, Meta, Field, Rule, and Latent.",
};

export default function Home() {
  return <MorsLightExperience />;
}
