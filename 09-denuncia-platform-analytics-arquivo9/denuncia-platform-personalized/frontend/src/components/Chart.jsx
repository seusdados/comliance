import React, { useEffect, useRef } from 'react';

// Componente reutilizável para gráficos simples. Utiliza Chart.js carregado via CDN global.
function Chart({ chartData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (!window.Chart) {
      return;
    }
    // Destrói gráfico anterior para evitar superposição
    if (canvasRef.current._chart) {
      canvasRef.current._chart.destroy();
    }
    const newChart = new window.Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
    canvasRef.current._chart = newChart;
  }, [chartData]);

  return <canvas ref={canvasRef}></canvas>;
}

export default Chart;