import { cn } from "@/lib/utils";

export const Hero = () => {
  return (
    <div className={cn("w-full relative h-screen")}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
          style={{ background: "radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)" }}
        />
      </div>
    </div>
  );
};

// --- Demo ---
export default function HeroDemo() {
  return <Hero />;
}

