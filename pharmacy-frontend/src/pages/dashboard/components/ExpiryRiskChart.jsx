import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

// ============================================
// REGISTER MODULES
// ============================================

ChartJS.register(
  ArcElement,

  Tooltip,

  Legend,
);

export default function ExpiryRiskChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.name),

    datasets: [
      {
        data: data.map((item) => item.value),

        backgroundColor: [
          "rgb(34,197,94)",

          "rgb(245,158,11)",

          "rgb(239,68,68)",
        ],

        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },
    },

    cutout: "70%",
  };

  return (
    <div className="chart-card">
      <h3>Expiry Risk Heatmap</h3>

      <div
        style={{
          height: "320px",
        }}
      >
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
