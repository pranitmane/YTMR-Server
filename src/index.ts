import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import cors from 'cors'
import http from 'http'
import getIPAddress from './utils/myip'
import setSystemVolume from './utils/setVolume'

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    try {
        res.sendFile(__dirname + '/public/index.html')
    } catch (error) {
        console.log(error)
    }
})
app.get('/status', (req, res) => {
    res.status(200).send('server is running')
})


server.listen(8080, () => {
    let ip = getIPAddress()
    console.log(`Server is running on http://${ip}:8080`)
})

const wss = new WebSocketServer({ server: server });

let previousStatus = ''

wss.on('connection', function connection(ws) {
    // let statusCount = 0

    if (previousStatus !== '') ws.send(JSON.stringify({ type: 'init', data: previousStatus }))

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        const jsonData = JSON.parse(data.toString());
        if (jsonData.type === 'sysCommand') {
            setSystemVolume(jsonData.data.volume)
        } else {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    if (jsonData.type === 'status') {
                        // console.log('status', statusCount++)
                        previousStatus = jsonData.data
                        client.send(JSON.stringify(jsonData))
                    }
                    if (jsonData.type === 'command') {
                        client.send(JSON.stringify(jsonData))
                    }
                }
            });
        }
    });
    console.log('connected clients:', wss.clients.size)
});

