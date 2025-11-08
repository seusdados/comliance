import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useTranslation } from '../useTranslation.js';
// Import Chart.js components
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register required elements for Chart.js
Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function Reports({ user }) {
  const t = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/metrics', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'X-Tenant-ID': user.tenantId,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMetrics(data.metrics || {});
        } else {
          setError(data.mensagem || 'Falha ao carregar métricas');
        }
      } catch (err) {
        setError('Erro de rede');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [user]);

  const handleExport = async (format) => {
    const fmt = format || 'csv';
    try {
      const response = await fetch(`http://localhost:3000/api/metrics/export?format=${fmt}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fmt === 'json' ? 'metrics.json' : 'metrics.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Falha ao exportar');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar user={user} onLogout={() => {}} />
        <div className="p-4">{t('loading') || 'Carregando…'}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <Navbar user={user} onLogout={() => {}} />
        <div className="p-4 text-red-600">{error}</div>
      </div>
    );
  }
  if (!metrics) {
    return (
      <div>
        <Navbar user={user} onLogout={() => {}} />
        <div className="p-4">Sem dados de métricas.</div>
      </div>
    );
  }

  // Constrói dados para gráficos
  const statusLabels = Object.keys(metrics.statusCounts || {});
  const statusData = Object.values(metrics.statusCounts || {});
  const categoryLabels = Object.keys(metrics.categoryCounts || {});
  const categoryData = Object.values(metrics.categoryCounts || {});
  const monthLabels = Object.keys(metrics.monthCounts || {}).sort();
  const monthData = monthLabels.map((m) => metrics.monthCounts[m]);
  const channelLabels = Object.keys(metrics.channelCounts || {});
  const channelData = Object.values(metrics.channelCounts || {});

  // Novas métricas: duração por etapa, recorrência, retaliação e pontos críticos
  const stageLabels = Object.keys(metrics.stageDurations || {});
  const stageData = stageLabels.map((s) => metrics.stageDurations[s]);
  const recurrenceLabels = Object.keys(metrics.recurrenceCategories || {});
  const recurrenceData = recurrenceLabels.map((c) => metrics.recurrenceCategories[c]);
  const criticalLabels = Object.keys(metrics.criticalCounts || {});
  const criticalData = criticalLabels.map((c) => metrics.criticalCounts[c]);


  // Utiliza cores baseadas no tema (fallback para azul e verde)
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#1e40af';
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || '#10b981';

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
    },
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Casos',
        data: statusData,
        backgroundColor: primaryColor.trim(),
      },
    ],
  };
  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Casos',
        data: categoryData,
        backgroundColor: categoryLabels.map((_, idx) => idx % 2 === 0 ? primaryColor.trim() : secondaryColor.trim()),
      },
    ],
  };
  const monthChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Casos',
        data: monthData,
        borderColor: primaryColor.trim(),
        backgroundColor: primaryColor.trim() + '44',
      },
    ],
  };
  const channelChartData = {
    labels: channelLabels,
    datasets: [
      {
        label: 'Casos',
        data: channelData,
        backgroundColor: channelLabels.map((_, idx) => idx % 2 === 0 ? primaryColor.trim() : secondaryColor.trim()),
      },
    ],
  };

  // Novos conjuntos de dados para os gráficos adicionais
  const stageChartData = {
    labels: stageLabels,
    datasets: [
      {
        label: t('AverageDays') || 'Dias',
        data: stageData,
        backgroundColor: primaryColor.trim(),
      },
    ],
  };
  const recurrenceChartData = {
    labels: recurrenceLabels,
    datasets: [
      {
        label: t('Cases') || 'Casos',
        data: recurrenceData,
        backgroundColor: recurrenceLabels.map((_, idx) => (idx % 2 === 0 ? primaryColor.trim() : secondaryColor.trim())),
      },
    ],
  };
  const criticalChartData = {
    labels: criticalLabels,
    datasets: [
      {
        label: t('Cases') || 'Casos',
        data: criticalData,
        backgroundColor: criticalLabels.map((_, idx) => (idx % 2 === 0 ? primaryColor.trim() : secondaryColor.trim())),
      },
    ],
  };

  return (
    <div>
      <Navbar user={user} onLogout={() => {}} />
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        <h2 className="text-xl font-semibold">{t('Reports') || 'Relatórios'}</h2>
        {/* Resumo de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium text-gray-600">{t('TotalCases') || 'Casos totais'}</h3>
            <p className="text-2xl font-bold">{metrics.totalCases}</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium text-gray-600">{t('AverageClosureTime') || 'Tempo médio de encerramento (dias)'}</h3>
            <p className="text-2xl font-bold">{metrics.averageClosureTime.toFixed(2)}</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium text-gray-600">{t('OpenCases') || 'Casos abertos'}</h3>
            <p className="text-2xl font-bold">{(metrics.statusCounts['novo'] || 0) + (metrics.statusCounts['triagem'] || 0) + (metrics.statusCounts['em_investigacao'] || 0) + (metrics.statusCounts['acoes'] || 0)}</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium text-gray-600">{t('RetaliationCases') || 'Casos de retaliação'}</h3>
            <p className="text-2xl font-bold">{metrics.retaliationCount || 0}</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium text-gray-600">{t('RecurringCategories') || 'Categorias recorrentes'}</h3>
            <p className="text-2xl font-bold">{Object.keys(metrics.recurrenceCategories || {}).length}</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium text-gray-600">{t('CriticalCases') || 'Casos críticos'}</h3>
            <p className="text-2xl font-bold">{Object.values(metrics.criticalCounts || {}).reduce((sum, v) => sum + v, 0)}</p>
          </div>
          {/* Botão de exportação ocupando uma coluna inteira */}
          <div className="border rounded p-4 shadow bg-white flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6">
            <button
              onClick={() => handleExport('csv')}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              {t('Export') || 'Exportar CSV'}
            </button>
          </div>
        </div>
        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Distribuição por status */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('StatusDistribution') || 'Distribuição por status'}</h3>
            <Bar data={statusChartData} options={barOptions} />
          </div>
          {/* Distribuição por categoria */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('CategoryDistribution') || 'Distribuição por categoria'}</h3>
            <Pie data={categoryChartData} options={pieOptions} />
          </div>
          {/* Casos por mês */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('MonthlyCases') || 'Casos por mês'}</h3>
            <Line data={monthChartData} options={lineOptions} />
          </div>
          {/* Distribuição por canal */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('ChannelDistribution') || 'Distribuição por canal'}</h3>
            <Bar data={channelChartData} options={barOptions} />
          </div>
          {/* Duração média por etapa */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('StageDurations') || 'Duração média por etapa'}</h3>
            <Bar data={stageChartData} options={barOptions} />
          </div>
          {/* Categorias recorrentes */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('RecurringCategoriesChart') || 'Recorrência de categorias'}</h3>
            <Bar data={recurrenceChartData} options={barOptions} />
          </div>
          {/* Pontos críticos (categorias de alta prioridade) */}
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-sm font-medium mb-2">{t('CriticalCategoriesChart') || 'Categorias críticas'}</h3>
            <Bar data={criticalChartData} options={barOptions} />
          </div>
        </div>
        {/* Export JSON */}
        <div className="mt-4">
          <button
            onClick={() => handleExport('json')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {t('ExportJson') || 'Exportar JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;