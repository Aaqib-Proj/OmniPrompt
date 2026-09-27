import React from 'react';
import { formatDate } from '../../lib/format';

interface DayActivity {
  date: string;
  count: number;
  level: number; // 0–4
}

interface ContributionHeatmapProps {
  days: DayActivity[];
  totalContributions: number;
}

const LEVELS = ['bg-line-muted', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent'];

const MONTH = new Intl.DateTimeFormat('en', { month: 'short' });

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ days, totalContributions }) => {
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Label a column when its first day starts a new month.
  const monthLabels = weeks.map((week, i) => {
    const month = new Date(week[0].date).getMonth();
    const previous = i > 0 ? new Date(weeks[i - 1][0].date).getMonth() : -1;
    return month !== previous && i < weeks.length - 2 ? MONTH.format(new Date(week[0].date)) : '';
  });

  return (
    <div className="box">
      <h2 className="px-4 pt-3 text-[13px]">
        <strong className="font-semibold tabular-nums">{totalContributions}</strong>{' '}
        <span className="text-fg-muted">contributions in the last year</span>
      </h2>

      <div className="px-4 pt-2 pb-3 overflow-x-auto">
        <div className="inline-block">
          <div className="flex gap-[3px] h-4 mb-1 text-[10px] text-fg-muted">
            {monthLabels.map((label, i) => (
              <span key={i} className="w-[10px] shrink-0 whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <span
                    key={day.date}
                    title={`${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${formatDate(day.date)}`}
                    className={`block w-[10px] h-[10px] rounded-[2px] ${LEVELS[day.level] ?? LEVELS[0]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 px-4 py-2 border-t border-line-muted text-[11px] text-fg-muted">
        <span className="mr-1">Less</span>
        {LEVELS.map((cls) => (
          <span key={cls} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
};
