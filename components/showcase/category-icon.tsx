import { Cloud, Drama, Drum, Flower2, Music2, Shield, Sparkles, Star } from "lucide-react";

export const SHOWCASE_ICONS = [
  { value: "music", label: "Music" },
  { value: "sparkles", label: "Sparkles" },
  { value: "drama", label: "Theatre" },
  { value: "shield", label: "Martial arts" },
  { value: "drum", label: "Drum" },
  { value: "cloud", label: "Cloud" },
  { value: "flower", label: "Flower" },
  { value: "star", label: "Star" },
] as const;

const icons = {
  music: Music2,
  sparkles: Sparkles,
  drama: Drama,
  shield: Shield,
  drum: Drum,
  cloud: Cloud,
  flower: Flower2,
  star: Star,
};

export function ShowcaseCategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.4} />;
}
