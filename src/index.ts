import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import cors from 'cors'
import http from 'http'
import getIPAddress from './utils/myip'

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.static(__dirname + '/public'))
console.log('dirname is:', __dirname)

app.get('/', (req, res) => {
    try{
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

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data, isBinary) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                const jsonData = JSON.parse(data.toString());
                if (jsonData.type === 'status') {
                    console.log(jsonData)
                    client.send(JSON.stringify(jsonData))
                }
                if (jsonData.type === 'command') {
                    console.log(jsonData)
                    client.send(JSON.stringify(jsonData))
                }
            }
        });
    });

    console.log('connected clients:', wss.clients.size)
});