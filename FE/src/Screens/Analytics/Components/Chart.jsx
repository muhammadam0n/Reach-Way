import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const LineChart = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Total Followers",
        data: [6000, 8000, 12000, 16000, 18000, 20000, 22000],
        borderColor: "rgba(0, 122, 255, 1)",
        backgroundColor: "rgba(0, 122, 255, 1)",
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: "white",
        pointBorderColor: "rgba(0, 122, 255, 1)",
        pointBorderWidth: 3,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0,0,0,0.8)",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        grid: {
          color: "black",
          borderDash: [8, 4],
        },
        ticks: {
          callback: function (value) {
            return value / 1000 + "k";
          },
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="relative h-[410px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
