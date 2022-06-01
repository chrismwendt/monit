import { Scatter } from 'react-chartjs-2'
import Chart, { ChartData, ScatterDataPoint } from 'chart.js/auto'
import { ForwardedRef, useEffect, useMemo, useRef, useState } from 'react'
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types'
import annotation from 'chartjs-plugin-annotation'
import strftime from 'strftime'
import ReconnectingWebSocket from 'reconnecting-websocket'

Chart.register(annotation)

var _ = Chart
// ^ forces chart.js to be included in the bundle

export function App() {
  const data = useMemo<ChartData<'scatter', ScatterDataPoint[], unknown>>(
    () => ({
      datasets: [
        { data: [], backgroundColor: 'purple', label: 'Postgres total RSS' },
      ],
    }),
    []
  )

  const ref:
    | ForwardedRef<ChartJSOrUndefined<'scatter', ScatterDataPoint[], unknown>>
    | undefined = useRef()

  useEffect(() => {
    const ws = new ReconnectingWebSocket('ws://localhost:3001/ws')
    ws.addEventListener('open', () => {
      // TODO pass cursor
      ws.addEventListener('message', ev => {
        try {
          for (const row of JSON.parse(ev.data)) {
            data.datasets[0].data.push({
              x: row.time_s,
              y: row.total_resident_size,
            })
          }
          ref.current?.update()
        } catch (e) {
          console.error(e)
        }
      })
    })

    return () => {
      switch (ws.readyState) {
        case ws.CONNECTING:
          ws.addEventListener('open', () => ws.close())
          break
        case ws.OPEN:
          ws.close()
          break
      }
    }
  }, [])

  const [now, setNow] = useState<number>(new Date().getTime() / 1000)

  useEffect(() => {
    const i = setInterval(() => setNow(new Date().getTime() / 1000), 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div>
      <Scatter
        ref={ref}
        options={{
          showLine: true,
          responsive: true,
          animation: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            tooltip: {
              callbacks: {
                label(item) {
                  const r: any = item.raw
                  return `${date(r.x)}: ${toMb(r.y)}`
                },
              },
            },
            annotation: {
              annotations: {
                annotation1: {
                  type: 'line',
                  borderWidth: 1,
                  label: {
                    backgroundColor: 'blue',
                    content: `Now: ${date(now)}`,
                    enabled: true,
                    position: 'end',
                  },
                  scaleID: 'x',
                  value: now,
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                callback: date,
              },
            },
            y: { ticks: { callback: toMb }, min: 0 },
          },
        }}
        data={data}
      />
    </div>
  )
}

const date = (value: string | number) =>
  typeof value === 'number' ? strftime('%F %T', new Date(value * 1000)) : value

const toMb = (value: string | number) =>
  typeof value === 'number' ? (value / 1000 / 1000).toFixed(0) + ' MB' : value
