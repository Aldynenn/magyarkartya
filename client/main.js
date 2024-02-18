const message = document.getElementById("message");
const send = document.getElementById("send");
const messageContainer = document.getElementById("message-container");

const ws = new WebSocket("ws://192.168.1.101:8080");

ws.onmessage = e => {
    const incoming = JSON.parse(e.data);
    console.log(incoming.data.clients);
    if (incoming.data.clients != undefined) {
        for (const client of incoming.data.clients) {
            const clientCursorID = `client-${client.id}`;
            if (!document.getElementById(clientCursorID)) {
                console.log("Client cursor already exists");
                const clientCursor = document.createElement("div");
                clientCursor.id = clientCursorID;
                clientCursor.classList.add("cursor");
                document.body.appendChild(clientCursor);
            }
            const indicator = document.getElementById(clientCursorID);
            indicator.style.left = `${client.cursor.x}px`;
            indicator.style.top = `${client.cursor.y}px`;
            indicator.style.backgroundColor = `#${client.id}`;
        }
    }
}

ws.onerror = e => {
    console.error(`WebSocket Error: ${e}`);
}

function sendMessage(data) {
    ws.send(JSON.stringify(data));
}

function getClientState(e) {
    let mouseX = null;
    let mouseY = null;
    let windowWidth = null;
    let windowHeight = null;

    if (!!e.clientX && !!e.clientY) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
    if (!!window.innerWidth && !!window.innerHeight) {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    }

    return {
        resolution: {
            width: windowWidth,
            height: windowHeight
        },
        cursor: {
            x: mouseX,
            y: mouseY
        }
    }
}

function sendUpdate(e) {
    sendMessage({
        event: e.type,
        state: getClientState(e),
        timestamp: Date.now()
    });
}

document.body.addEventListener("mousemove", e => {
    sendUpdate(e);
});
document.body.addEventListener("click", e => {
    sendUpdate(e);
});
window.addEventListener("resize", e => {
    sendUpdate(e);
});

// send.addEventListener("click", () => {
//     sendMessage();
// });
// let isShift = false;
// message.addEventListener("keydown", e => {
//     isShift = e.key === "Shift";
//     if (e.key === "Enter" && !isShift) {
//         sendMessage();
//     }
// });