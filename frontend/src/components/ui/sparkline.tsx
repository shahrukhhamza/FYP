/**
 * Decorative trend sparkline. The line stays in a de-emphasis (muted) color
 * regardless of direction — up/down status color belongs on the paired
 * icon+label badge next to it, never on the mark itself (see dataviz skill:
 * "text/marks never wear status color alone" + "trend: sparkline in the
 * de-emphasis hue"). The numeric value and % change are shown as text next
 * to this, so the chart itself is decorative and can be aria-hidden.
 */
export function Sparkline({
  values,
  width = 72,
  height = 28,
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pad = 3;

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const [lastX, lastY] = points[points.length - 1];
  const areaPath = `${linePath} L${lastX.toFixed(1)},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <path d={areaPath} fill="var(--muted-foreground)" opacity={0.08} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="var(--muted-foreground)" />
    </svg>
  );
}
