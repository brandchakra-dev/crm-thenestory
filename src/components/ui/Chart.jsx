// import React from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// export default function Chart({ labels = [], datasets = [] }) {
//   const data = { labels, datasets };
//   return <div className="bg-white p-4 rounded shadow"><Line data={data} /></div>;
// }


import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';

const Chart = ({ 
  type = 'line', 
  data, 
  options = {}, 
  width = '100%', 
  height = '100%',
  className = ''
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data || !data.labels || !data.datasets) {
      return;
    }

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    
    // Default options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      ...options
    };

    // Create chart
    chartInstance.current = new ChartJS(ctx, {
      type: type,
      data: data,
      options: defaultOptions
    });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  if (!data || !data.labels || !data.datasets) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ width, height }}>
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default Chart;