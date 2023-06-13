const fs = require('fs')
const WebSocket = require('ws')

// Replace these with your actual parameters
const cluster_id = 'your_cluster_id'
const token = 'your_token'
const log_type = 'your_log_type'
const sender_email = 'sender@example.com' // sender's email address
const verbose = true // change to false if you don't want verbose logging
const chunk_size = 100 // change as needed
const output_file_dir = '.' // change as needed

// Calculate 24 hours ago timestamp
const since_time = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
const to_time = new Date().toISOString()

const url = `wss://logstream.proofpoint.com:443/v1/stream?cid=${encodeURIComponent(
  cluster_id
)}&type=${log_type}&sinceTime=${encodeURIComponent(
  since_time
)}&toTime=${encodeURIComponent(to_time)}`

if (verbose) {
  console.log(`URL: ${url}`)
}

const headers = {
  Authorization: `Bearer ${token}`,
}

const ws = new WebSocket(url, {
  headers: headers,
})

let output_file_abs_path = `${output_file_dir}/pps_${log_type}_${Date.now()}_${since_time.replace(
  ':',
  '-'
)}_${to_time.replace(':', '-')}.txt`

if (verbose) {
  console.log(`Exporting data to: ${output_file_abs_path}`)
}

let data_count = 0
let records_chunk = []

ws.on('message', function incoming(data) {
  let result = JSON.parse(data)

  // Assuming that result.senderEmail and result.sentTimestamp exist
  if (result.senderEmail === sender_email) {
    records_chunk.push(result)
    data_count++

    if (data_count % chunk_size === 0) {
      if (verbose) {
        console.log(
          `Exporting chunk#${data_count / chunk_size} with ${
            records_chunk.length
          } records`
        )
      }
      fs.appendFileSync(
        output_file_abs_path,
        records_chunk.map((record) => JSON.stringify(record)).join('\n') + '\n'
      )
      records_chunk = []
    }
  }
})

ws.on('close', function close() {
  if (records_chunk.length > 0) {
    if (verbose) {
      console.log(
        `Exporting chunk#${Math.floor(data_count / chunk_size) + 1} with ${
          records_chunk.length
        } records`
      )
    }
    fs.appendFileSync(
      output_file_abs_path,
      records_chunk.map((record) => JSON.stringify(record)).join('\n') + '\n'
    )
  }
  console.log(`Successfully collected total ${data_count} records!`)
})

ws.on('error', function error(err) {
  console.log(
    `Failed to fetch data from server! Total ${data_count} records fetched.`
  )
  console.log(err.toString())
})
