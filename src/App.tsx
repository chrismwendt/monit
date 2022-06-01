import { Scatter } from "react-chartjs-2";
import Chart, { ChartOptions } from "chart.js/auto";

var _ = Chart;
// ^ forces chart.js to be included in the bundle

export function App() {
  return (
    <Scatter
      options={{
        showLine: true,
        responsive: true,
        animation: false,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: "Chart.js Line Chart",
          },
        },
      }}
      data={{
        datasets: [
          {
            label: "Dataset 1",
            data: [1, 3, 4].map((x) => ({ x, y: Math.random() * 100 })),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
          {
            label: "Dataset 2",
            data: [1, 3, 4].map((x) => ({ x, y: Math.random() * 100 })),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      }}
    />
  );
}
