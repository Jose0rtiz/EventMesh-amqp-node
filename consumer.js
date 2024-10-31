const msg    = require('@sap/xb-msg');
require('dotenv').config();

const options = {
    "destinations": [{
        "name": "TheEventMeshSvcForMyProject",   //<- Dar un nombre cualquiera
        "type": "amqp-v100", //<- Valor específico para amqp
        "peer": {
            "type": "sapmgw" //<- Valor específico para amqp
        },
        "oa2": {
            "endpoint": process.env.tokenEndpoint,
            "client": process.env.clientId,
            "secret": process.env.clientSecret,
        },
        "uri": process.env.amqpUri,
        "istreams": {
            "MyIStream": {
                "sndSettleMode": 0,
                "rcvSettleMode": 0,
                "source": {
                    "address": "queue:"+ process.env.queueName, 
                    "expires": "connection-close",
                    "timeout": 0,
                    "durable": 0
                },
                "target": {
                    "expires": "connection-close",
                    "timeout": 0,
                    "durable": 0
                }
            }
        },
        "ostreams": {},
        "amqp": {}
    }]
};

// Inicializar cliente de mensajería
const client = new msg.Client(options);

client.on("connected", () => {
    console.log("connected to SAP Event Mesh.");
})
.on("error", (err) => {
    console.log("Error when connecting to the SAP Event Mesh: " + err);
})
.on("disconnected", (hadError) => {
    console.log("Connection to SAP Event Mesh was lost, trying to reconnect in 60 seconds");
    setTimeout(()=> client.connect(), 60000); //<- Automatically re-connect when disconnected.
});

//Suscripción a la cola
client.istream("MyIStream")
.on('subscribed', () =>{
    console.log("Successfully subscribed to the target queue.");
})
.on("ready", () => {
    console.log("Stream is ready");
})
.on("data", (message) => { //<-This is the message handler
    console.log("Message received: " + message.payload.toString());
    let processSuccess = false;
    try {//<- Now process the message Put it in a try-catch-finally block
        processSuccess = true;
    }catch(err) {
        processSuccess = false;  // very likely to be false.
    }finally {
        if( processSuccess ){
            message.done(); //<- De-queue the message
        }
        else {
            message.failed();  //<- Let the message stay in the queue
            console.log("Failed to process the message. Reason:………. Exiting. ");
            process.exit(1); //<- Can’t continue. Exiting.
        }
    }
});
// Conexión del cliente
client.connect();
