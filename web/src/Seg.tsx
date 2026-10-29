// A row of mutually exclusive buttons, one pressed.
export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <span className="seg">
      {options.map((o) => (
        <button key={o} aria-pressed={o === value} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </span>
  );
}
