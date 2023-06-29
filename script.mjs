import { API_KEY, clusterID } from './connection.mjs'
import WebSocket from 'ws'

const sinceTime = '2023-06-28'
const toTime = '2023-06-29'

async function fetchHistoricalData() {
  const url = `wss://logstream.proofpoint.com/v1/stream?cid=${clusterID}&type=message&sinceTime=${sinceTime}&toTime=${toTime}`
  const headers = {
    // 'X-Proofpoint-API-Key': API_KEY,
    Authorization: `Bearer ${API_KEY}`,
  }

  const ws = new WebSocket(url, {
    headers: headers,
  })

  ws.on('open', function open() {
    console.log('connected')
  })

  ws.on('close', function close() {
    console.log('disconnected')
  })

  ws.on('message', function incoming(data) {
    console.log(data)
  })
}
fetchHistoricalData()
