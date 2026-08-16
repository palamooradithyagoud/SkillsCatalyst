import SpeederLoader from "@/components/SpeederLoader";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <SpeederLoader label="Loading SkillsCatalyst..." scale={1} />
    </div>
  );
}
