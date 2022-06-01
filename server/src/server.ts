/// <reference types="vite/client" />

import express from 'express'
import expressWs from 'express-ws'
import execSh from 'exec-sh'
import fs from 'fs'
import { Subject } from 'rxjs'

const exec = execSh.promise

const sub = new Subject<object>()

const app = expressWs(express()).app

app.ws('/ws', function (ws, req) {
  try {
    ws.send(
      JSON.stringify(
        fs
          .readFileSync('log.jsonl', 'utf8')
          .split('\n')
          .filter(line => line)
          .flatMap(line => {
            try {
              return [JSON.parse(line)]
            } catch (e) {
              return []
            }
          })
      )
    )

    const s = sub.subscribe(line => ws.send(JSON.stringify([line])))
    ws.on('close', () => s.unsubscribe())
  } catch (e) {
    console.error(e)
  }
})

app.listen(3001)

const sample = async () => {
  const { stdout, stderr } = await exec('~/postgres-rss-monitor.py', true)
  if (stderr !== '') console.error(stderr)
  try {
    const event = JSON.parse(stdout)
    fs.appendFileSync('log.jsonl', JSON.stringify(event) + '\n')
    sub.next(event)
  } catch (e) {
    console.error(e)
  }
}

sample()
setInterval(sample, 10000)
