const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());

// `public` フォルダーの静的ファイルを提供
app.use(express.static('public'));

const rooms = []; // roomsを空の配列として初期化

function broadcastParticipantCount() {
    const participantCount = wss.clients.size;
    const message = JSON.stringify({ type: 'updateParticipants', participantCount: participantCount });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('新しいクライアントが接続しました。');
    broadcastParticipantCount(); // 新しいクライアントが接続された際に参加者数を更新

    ws.on('close', () => {
        console.log('クライアントが切断されました。');
        broadcastParticipantCount(); // クライアントが切断された際に参加者数を更新
    });

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            const room = rooms.find(r => r.roomId === data.roomId);
            if (room) {
                room.participants.push(ws);
                ws.send(JSON.stringify({ type: 'join', roomId: data.roomId, roomExists: true }));
            } else {
                ws.send(JSON.stringify({ type: 'join', roomId: data.roomId, roomExists: false }));
            }
        } else if (data.type === 'leave') {
            const room = rooms.find(r => r.roomId === data.roomId);
            if (room) {
                room.participants = room.participants.filter(participant => participant !== ws);
                if (room.participants.length === 0) {
                    const roomIndex = rooms.indexOf(room);
                    if (roomIndex > -1) {
                        rooms.splice(roomIndex, 1);
                    }
                }
            }
        }
    });
});

app.post('/create-room', (req, res) => {
    const roomId = generateRoomId();
    const newRoom = {
        roomId: roomId,
        participants: []
    };

    rooms.push(newRoom); // rooms配列に新しいルームを追加

    res.json({ success: true, roomId: roomId });
});

function generateRoomId() {
    return Math.random().toString(36).substring(2, 10);
}

server.listen(8080, () => {
    console.log('サーバーがポート 8080 で起動しました。');
});
