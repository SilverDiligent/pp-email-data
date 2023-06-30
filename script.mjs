import { API_KEY, clusterID } from './connection.mjs'
import WebSocket from 'ws'

const sinceTime = '2023-06-28'
const toTime = '2023-06-29'

function fetchHistoricalData() {
  const url = `wss://logstream.proofpoint.com/v1/stream?cid=${clusterID}&type=message&sinceTime=${sinceTime}&toTime=${toTime}`
  const headers = {
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
    const dataString = data.toString()
    console.log('Received data:', dataString)

    const message = JSON.parse(dataString)

    // Check if the sender's email is located inside message.msg.parsedAddresses.from[0]
    if (
      message.msg &&
      message.msg.parsedAddresses &&
      message.msg.parsedAddresses.from &&
      message.msg.parsedAddresses.from[0] === 'alexis.crawford@srpnet.com'
    ) {
      console.log('Filtered message:', message)
    } else {
      console.log('Message sender does not match.')
    }
  })

  ws.on('error', function error(err) {
    console.error(`WebSocket error: ${err}`)
  })
}

fetchHistoricalData()
