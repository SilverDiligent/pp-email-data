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
    // console.log('Received data:', data)
    const dataString = data.toString()
    console.log('received data:', dataString)

    const messages = JSON.parse(dataString)
    console.log('Parsed messages:', messages)

    // If messages is an object and has a "sender" property, put it into an array for filtering
    if (
      typeof messages === 'object' &&
      !Array.isArray(messages) &&
      messages.sender
    ) {
      messages = [messages]
    }

    if (Array.isArray(messages)) {
      const filteredMessages = messages.filter(
        (message) => message.sender === 'alexis.crawford@srpnet.com'
      )
      console.log('Filtered messages:', filteredMessages)
    } else {
      console.log('Messages is not an array.')
    }
  })

  ws.on('error', function error(err) {
    console.error('WebSocket error: ${error}')
  })
}
fetchHistoricalData()
