// 'use client';

// import React, { useState } from 'react';
// import dynamic from 'next/dynamic';
// import 'react-calendar-heatmap/dist/styles.css';

// const CalendarHeatmap = dynamic(() => import('react-calendar-heatmap'), { ssr: false });

// interface HeatmapDataItem {
//   date: string;
//   count: number;
// }

// interface StreakHeatmapProps {
//   data: HeatmapDataItem[];
// }

// export default function StreakHeatmap({ data }: StreakHeatmapProps) {
//   const [tooltipContent, setTooltipContent] = useState<string | null>(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

//   const today = new Date();
//   const startDate = new Date();
//   startDate.setDate(today.getDate() - 364); // Last 365 days

//   const handleMouseEnter = (event: React.MouseEvent<SVGRectElement>, value: HeatmapDataItem) => {
//     if (value) {
//       const date = new Date(value.date).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//       setTooltipContent(`${date}: ${value.count} activities`);
//       setTooltipPosition({ x: event.clientX, y: event.clientY });
//     }
//   };

//   const handleMouseLeave = () => {
//     setTooltipContent(null);
//   };

//   return (
//     <div className="mt-6 bg-gray-900 p-6 rounded-lg shadow-lg">
//       <h2 className="text-green-400 text-2xl font-bold mb-4">Activity Heatmap</h2>
//       <div className="overflow-x-auto">
//         <CalendarHeatmap
//           startDate={startDate}
//           endDate={today}
//           values={data}
//           classForValue={(value) => {
//             if (!value || value.count === 0) return 'color-empty';
//             if (value.count >= 4) return 'color-scale-4';
//             if (value.count === 3) return 'color-scale-3';
//             if (value.count === 2) return 'color-scale-2';
//             return 'color-scale-1';
//           }}
//           showWeekdayLabels={true}
//           gutterSize={3}
//           tooltipDataAttrs={(value: HeatmapDataItem) => ({
//             'data-tip': value ? `${value.date}: ${value.count} activities` : null,
//           })}
//           onMouseOver={(event, value) => handleMouseEnter(event, value)}
//           onMouseLeave={handleMouseLeave}
//         />
//       </div>
//       <div className="flex justify-end mt-4">
//         <div className="flex items-center space-x-2">
//           <span className="text-xs text-gray-400">Less</span>
//           {['#1a1a1a', '#d6e685', '#8cc665', '#44a340', '#1e6823'].map((color, index) => (
//             <div key={index} className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
//           ))}
//           <span className="text-xs text-gray-400">More</span>
//         </div>
//       </div>
//       {tooltipContent && (
//         <div
//           className="absolute bg-gray-800 text-white p-2 rounded shadow-lg text-sm z-10"
//           style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
//         >
//           {tooltipContent}
//         </div>
//       )}
//       <style jsx global>{`
//         .react-calendar-heatmap {
//           font-size: 8px;
//         }
//         .react-calendar-heatmap text {
//           fill: #aaa;
//         }
//         .react-calendar-heatmap .color-empty {
//           fill: #1a1a1a;
//         }
//         .react-calendar-heatmap .color-scale-1 {
//           fill: #d6e685;
//         }
//         .react-calendar-heatmap .color-scale-2 {
//           fill: #8cc665;
//         }
//         .react-calendar-heatmap .color-scale-3 {
//           fill: #44a340;
//         }
//         .react-calendar-heatmap .color-scale-4 {
//           fill: #1e6823;
//         }
//         .react-calendar-heatmap rect:hover {
//           stroke: #555;
//           stroke-width: 1px;
//         }
//         .react-calendar-heatmap .react-calendar-heatmap-weekday-labels {
//           font-size: 6px;
//         }
//       `}</style>
//     </div>
//   );
// }


'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar-heatmap/dist/styles.css';

const CalendarHeatmap = dynamic(() => import('react-calendar-heatmap'), { ssr: false });

interface HeatmapDataItem {
  date: string;
  count?: number;
}

interface StreakHeatmapProps {
  data: HeatmapDataItem[];
}

export default function StreakHeatmap({ data }: StreakHeatmapProps) {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 364);

  const handleMouseEnter = (event: React.MouseEvent<SVGRectElement, MouseEvent>, value: HeatmapDataItem | undefined) => {
    if (value && value.date && value.count !== undefined) {
      const date = new Date(value.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const { clientX, clientY } = event;
      const newX = clientX + 10 > window.innerWidth - 200 ? clientX - 200 : clientX + 10; // Adjust for right edge
      const newY = clientY + 10 > window.innerHeight - 50 ? clientY - 50 : clientY + 10; // Adjust for bottom edge
  
      setTooltipContent(`${date}: ${value.count} activities`);
      setTooltipPosition({ x: newX, y: newY });
    }
  };
  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <div className="mt-6 bg-black p-6 rounded-lg shadow-lg">
      <h2 className="text-green-400 text-2xl font-bold mb-4">Activity Heatmap</h2>
      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={data}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count >= 4) return 'color-scale-4';
            if (value.count === 3) return 'color-scale-3';
            if (value.count === 2) return 'color-scale-2';
            if (value.count === 1) return 'color-scale-1';
            console.log('value', value);
            return 'color-empty';
           
          }}
          showWeekdayLabels={true}
          gutterSize={3}
          tooltipDataAttrs={(value: { date: Date; count: number; }) => ({
            'data-tip': value ? `${value.date}: ${value.count || 0} activities` : null,
          })}
          onMouseOver={(event, value) => {
            const heatmapValue = value as HeatmapDataItem | undefined;
            handleMouseEnter(event, heatmapValue);
          }}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <div className="flex justify-end mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Less</span>
          {['#1a1a1a', '#d6e685', '#8cc665', '#44a340', '#1e6823'].map((color, index) => (
            <div key={index} className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
          ))}
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
      {tooltipContent && (
        <div
          className="absolute bg-gray-800 text-white p-2 rounded shadow-lg text-sm z-10"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
        >
          {tooltipContent}
        </div>
      )}
      <style jsx global>{`
        .react-calendar-heatmap {
          font-size: 8px;
        }
        .react-calendar-heatmap text {
          fill: #aaa;
        }
        .react-calendar-heatmap .color-empty {
          fill: #111111; /* Black for empty cells */
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #d6e685; /* Light green */
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #8cc665; /* Medium green */
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #44a340; /* Darker green */
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #1e6823; /* Darkest green */
        }
        .react-calendar-heatmap rect:hover {
          stroke: #555;
          stroke-width: 1px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-labels {
          font-size: 6px;
        }
      `}</style>
    </div>
  );
}
