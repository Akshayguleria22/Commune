import React from 'react';

interface ContributionDay {
  date: string;
  intensity: number;
}

interface ContributionHeatmapProps {
  data: ContributionDay[];
  weeks?: number;
}

const CELL_SIZE = 13;
const CELL_GAP = 3;
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const getColor = (intensity: number): string => {
  if (intensity === 0) return 'var(--c-glass-highlight)';
  if (intensity <= 2) return 'rgba(124, 106, 239, 0.25)';
  if (intensity <= 4) return 'rgba(124, 106, 239, 0.45)';
  if (intensity <= 6) return 'rgba(124, 106, 239, 0.65)';
  return 'rgba(124, 106, 239, 0.9)';
};

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  data,
  weeks = 26,
}) => {
  const totalDays = weeks * DAYS_PER_WEEK;
  const today = new Date();

  const intensityMap = new Map<string, number>();
  data.forEach((d) => intensityMap.set(d.date, d.intensity));

  const cells: { x: number; y: number; date: string; intensity: number }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const weekIdx = Math.floor((totalDays - 1 - i) / 7);
    cells.push({
      x: weekIdx * (CELL_SIZE + CELL_GAP) + 30,
      y: dayOfWeek * (CELL_SIZE + CELL_GAP),
      date: dateStr,
      intensity: intensityMap.get(dateStr) || 0,
    });
  }

  const svgWidth = weeks * (CELL_SIZE + CELL_GAP) + 34;
  const svgHeight = DAYS_PER_WEEK * (CELL_SIZE + CELL_GAP);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <svg width={svgWidth} height={svgHeight + 20}>
        {DAY_LABELS.map((label, i) => (
          <text
            key={i}
            x={0}
            y={i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
            fill="var(--c-text-dim)"
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fontWeight={500}
          >
            {label}
          </text>
        ))}

        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={3}
            ry={3}
            fill={getColor(cell.intensity)}
            style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
          >
            <title>{`${cell.date}: ${cell.intensity} contributions`}</title>
          </rect>
        ))}
      </svg>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        justifyContent: 'flex-end', marginTop: 4,
      }}>
        <span style={{ fontSize: 10, color: 'var(--c-text-dim)', marginRight: 3, fontWeight: 500 }}>Less</span>
        {[0, 2, 4, 6, 8].map((level) => (
          <div
            key={level}
            style={{
              width: 13, height: 13, borderRadius: 3,
              background: getColor(level),
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: 'var(--c-text-dim)', marginLeft: 3, fontWeight: 500 }}>More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
