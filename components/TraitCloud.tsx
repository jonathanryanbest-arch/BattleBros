// Renders the cached trait cloud for a friend's profile.
// Words are sized by weight: heavier traits appear larger.

type CloudTag = {
  tag: string;
  displayTag: string;
  weight: number;
};

type Props = {
  traits: CloudTag[];
  emptyMessage?: string;
};

function fontSizePx(weight: number, maxWeight: number): number {
  const min = 14;
  const max = 36;
  if (maxWeight <= 0) return min;
  const ratio = weight / maxWeight;
  return Math.round(min + (max - min) * ratio);
}

export function TraitCloud({ traits, emptyMessage }: Props) {
  if (traits.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        {emptyMessage ?? "No traits yet."}
      </p>
    );
  }
  const maxWeight = traits.reduce((m, t) => Math.max(m, t.weight), 0);
  return (
    <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      {traits.map((t) => (
        <li
          key={t.tag}
          className="inline-block leading-tight text-neutral-200"
          style={{ fontSize: `${fontSizePx(t.weight, maxWeight)}px` }}
          title={`weight ${t.weight}`}
        >
          {t.displayTag}
        </li>
      ))}
    </ul>
  );
}
