const COLOR: Record<string, string> = {
  W: "bg-turf",
  D: "bg-amber",
  L: "bg-red",
};

export default function FormDots({ form }: { form: string[] }) {
  return (
    <div className="flex gap-1.5">
      {form.map((f, i) => (
        <span
          key={i}
          className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold text-bg flex items-center justify-center ${COLOR[f]}`}
        >
          {f}
        </span>
      ))}
    </div>
  );
}
