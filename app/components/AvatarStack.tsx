import { PersonAvatar } from "./illustrations";

/** Overlapping row of friendly avatar illustrations + an honest framing line. */
export default function AvatarStack({
  count = 5,
  label = "Join the founding cohort building African AI",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {Array.from({ length: count }).map((_, i) => (
          <PersonAvatar
            key={i}
            seed={i}
            className="h-9 w-9 rounded-full ring-2 ring-white"
          />
        ))}
      </div>
      <p className="max-w-[16rem] text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
