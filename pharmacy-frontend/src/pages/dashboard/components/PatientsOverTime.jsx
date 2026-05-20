import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

// ============================================
// REGISTER CHART MODULES
// ============================================

ChartJS.register(
  CategoryScale,

  LinearScale,

  BarElement,

  Tooltip,

  Legend,
);

export default function PatientsOverTime({ data = [] }) {
  // ============================================
  // EMPTY STATE
  // ============================================

  if (!data.length) {
    return (
      <div className="chart-card">
        <h3>Patients Over Time</h3>

        <p>No patient analytics available.</p>
      </div>
    );
  }

  // ============================================
  // CHART DATA
  // ============================================

  const chartData = {
    labels: data.map((item) => item.month),

    datasets: [
      {
        label: "Patients Registered",

        data: data.map((item) => item.patients),

        backgroundColor: "rgba(6,95,228,0.82)",

        borderRadius: 10,

        borderSkipped: false,

        maxBarThickness: 42,
      },
    ],
  };

  // ============================================
  // CHART OPTIONS
  // ============================================

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#111827",

        padding: 12,

        titleFont: {
          size: 14,
        },

        bodyFont: {
          size: 13,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#6b7280",

          font: {
            size: 12,

            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "rgba(0,0,0,0.05)",
        },

        ticks: {
          color: "#6b7280",

          font: {
            size: 12,
          },
        },
      },
    },
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Patients Over Time</h3>

          <p className="chart-subtitle">
            Monthly patient registration activity
          </p>
        </div>
      </div>

      <div
        style={{
          height: "340px",
          width: "100%",
        }}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
