const createRoomButton = document.getElementById('createRoomButton');
const joinRoomButton = document.getElementById('joinRoomButton');
const startGameButton = document.getElementById('startGameButton');
const participantCountElement = document.getElementById('participantCount');
const statusElement = document.getElementById('status');

let ws;
let roomId;

createRoomButton.addEventListener('click', () => {
    fetch('/create-room', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        roomId = data.roomId;
        statusElement.textContent = `部屋が作成されました。部屋ID: ${roomId}`;
        startWebSocket();
    });
});

joinRoomButton.addEventListener('click', () => {
    roomId = prompt('参加したい部屋のIDを入力してください:');
    if (roomId) {
        startWebSocket();
    }
});

startGameButton.addEventListener('click', () => {
    if (ws && roomId) {
        ws.send(JSON.stringify({ type: 'startGame', roomId: roomId }));
    }
});

function startWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', roomId: roomId }));
        startGameButton.disabled = false;
    };

    ws.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === 'updateParticipants') {
            participantCountElement.textContent = `参加者数: ${data.participantCount}`;
        } else if (data.type === 'startGame') {
            statusElement.textContent = 'ゲームが開始されました！';
            startGame();
        } else if (data.type === 'join' && data.roomExists === false) {
            statusElement.textContent = '部屋が存在しません。';
            ws.close();
        }
    };

    ws.onclose = () => {
        startGameButton.disabled = true;
    };
}

function startGame() {
    // ゲームを開始するためのロジックをここに追加します。
    // 例えば、ゲームステージを表示したり、ゲームロジックを初期化したりします。
}
