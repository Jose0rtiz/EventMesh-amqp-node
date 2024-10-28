const msg    = require('@sap/xb-msg');
require('dotenv').config();

const options = {
    "destinations": [{
        "name": "TheEventMeshSvcForMyProject",   //<- Give any name
        "type": "amqp-v100", //<- Use this value or what's found in the Service Key
        "peer": {
            "type": "sapmgw" //<- Use this value
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

// Start messaging client
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

//Subscribe to the Queue and Process Messages
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
// All handlers are ready and now connect:
client.connect();

async function dequeueLastMessage() {
    return new Promise( async (resolve, reject)=> {
        let oAuthToken = process.env.tokenEndpoint; //Obtain an OAuth token first.
        const url = process.env.evenMeshUrl + "/messagingrest/v1/queues/"+ process.env.queueNameF+"/messages"
        let resp = await Axios( { //<- Get the last message
                method: "POST",
                url: url + "/consumption",
                headers: {  "content-type": "application/json", "x-qos":"1", "Authorization":"Bearer " + oAuthToken}
            });
    
            if( resp.status == 200) {  //<- Message successfully retrieved.
                let messageId = resp.headers["x-message-id"];//<- Get the message’s ID
    
                let ack = await Axios( { //<- Acknowledge the queue to remove the message.
                    method: "POST",
                    url: url + messageId + "/acknowledgement",
                    headers: {"content-type": "application/json", "x-qos":"1", "Authorization":"Bearer " + oAuthToken}
                });

                resolve(ack);
            }
            else {
                resolve(resp);
            }
        });
    }