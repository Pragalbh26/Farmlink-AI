import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export const PriceTrendChart = ({ data, unit = '₹ / Quintal' }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No price series data available</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((entry, index) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={index} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300 capitalize">{entry.name}:</span>
                <span className="font-bold text-white">₹{entry.value}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorBounds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fef3c7" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#fef3c7" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            dy={5}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            domain={['auto', 'auto']}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />

          {/* Uncertainty Bounds */}
          <Area
            type="monotone"
            dataKey="upper"
            name="Upper Bound (+95% Conf)"
            stroke="transparent"
            fill="#fef3c7"
            fillOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="lower"
            name="Lower Bound (-95% Conf)"
            stroke="transparent"
            fill="transparent"
          />

          {/* Historical Observed Prices */}
          <Area
            type="monotone"
            dataKey="actual"
            name="Observed AGMARKNET Modal"
            stroke="#15803d"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorActual)"
          />

          {/* Predicted Curve */}
          <Area
            type="monotone"
            dataKey="predicted"
            name="AI Forecast (XGBoost)"
            stroke="#d97706"
            strokeWidth={3}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorPredicted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
