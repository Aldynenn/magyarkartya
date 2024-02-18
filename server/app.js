import WebSocket, { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });
const clients = new Map();

server.on("connection", client => {
    const clientID = addClient(client);
    sendToAllClients({
        sender: "server",
        recipient: "all",
        data: {
            event: "client-connected",
            client: clientID,
            timestamp: Date.now()
        }
    });

    client.on("message", message => {
        const data = JSON.parse(message.toString());
        console.log(data);
        updateClientInfo(clientID, {
            resolution: data.state.resolution, 
            cursor: data.state.cursor
        });

        try {
            const data = JSON.parse(message.toString());
            console.log(data);
            const clientsInfo = Array.from(clients.values()).map(client => client.info);
            const dataToBeSent = {
                sender: "server",
                recipient: "all",
                data: {
                    clients: clientsInfo,
                    timestamp: Date.now()
                }
            };
            sendToAllClients(dataToBeSent);
        }
        catch (error) {
            console.error(`[!] Invalid message format from client: ${clientID}\n    Message content: "${message}"`);
            return;
        }
    });

    client.on("close", () => {
        removeClient(clientID);
        sendToAllClients({
            sender: "server",
            recipient: "all",
            data: {
                event: "client-disconnected",
                client: clientID,
                timestamp: Date.now()
            }
        });
    });

    client.on("error", error => {
        console.error(`WebSocket Error: ${error}`);
    });
});

function generateID() {
    let result = "";
    // const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const characters = "0123456789ABCDEF"; // 16 characters, can be used for HEX color codes
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function addClient(client) {
    const clientID = generateID();
    clients.set(clientID, {
        socket: client,
        info: {
            id: clientID,
            resolution: {
                width: null,
                height: null
            },
            cursor: {
                x: null,
                y: null
            }
        }
    });
    console.log(`[+] ${clientID} connected    - ${clients.size}`);
    return clientID;
}
function removeClient(clientID) {
    console.log(`[-] ${clientID} disconnected - ${clients.size}`);
    clients.delete(clientID);
}
function updateClientInfo(clientID, info) {
    clients.get(clientID).info.resolution = info.resolution;
    clients.get(clientID).info.cursor = info.cursor
}


function sendToAllClients(data) {
    for (const client of clients.values()) {
        client.socket.send(JSON.stringify(data));
    }
}
function sendToClient(clientID, data) {
    clients.get(clientID).socket.send(JSON.stringify(data));
}



function generateCardPack() {
    const colors = ["piros", "tök", "zöld", "makk"];
    const values = ["7", "8", "9", "10", "alsó", "felső", "király", "ász"];
    const cards = [];
    for (const color of colors) {
        for (const value of values) {
            cards.push(`${color} ${value}`);
        }
    }
    return cards;
}

function shuffleCardPack(pack) {
    for (let i = pack.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pack[i], pack[j]] = [pack[j], pack[i]];
    }
    return pack;
}

// import tty from "node:tty";
// console.log("Terminal size: " + process.stdout.columns + " * " + process.stdout.rows);
// process.stdout.on("resize", () => {
//     console.log("Screen size changed!");
//     console.log("Terminal size: " + process.stdout.columns + " * " + process.stdout.rows);
// }); 

console.log("WebSocket server running on port 8080");