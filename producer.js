const msg = require('@sap/xb-msg');

// Configuración de la conexión y autenticación
const options = {
    "destinations": [{
        "name": "TheEventMeshSvcForMyProject",
        "type": "amqp-v100",
        "peer": {
            "type": "sapmgw"
        },
        "oa2": {
            "endpoint": process.env.tokenEndpoint,
            "client": process.env.clientId,
            "secret": process.env.clientSecret,
        },
        "uri": process.env.amqpUri,
        "ostreams": {
            "MyOStream": {
                "sndSettleMode": 0,
                "rcvSettleMode": 0,
                "source": {
                    "address": "topic:"+ process.env.topicName, 
                    "expires": "connection-close",
                    "timeout": 0,
                    "durable": 0
                }
            }
        },
        "amqp": {}
    }]
};

// Inicializar cliente de mensajería
const client = new msg.Client(options);

client.on("connected", () => {
    console.log("Conectado a SAP Event Mesh.");

    try {
        // Enviar un mensaje cuando se conecte
        sendMessage("Hola, este es un mensaje enviado a SAP Event Mesh");
        console.log("Mensaje enviado correctamente.");
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
    } finally {
        // Desconectar después de intentar enviar el mensaje
        client.disconnect();
    }
})
.on("error", (err) => {
    console.log("Error al conectarse a SAP Event Mesh: " + err);
})

// Conectar al Event Mesh
client.connect();

// Función para enviar mensajes
function sendMessage(content) {
    // Crear el stream de salida
    const ostream = client.ostream("MyOStream");

    // Enviar el mensaje al stream
    ostream.write({
        payload: Buffer.from(content),
        messageAnnotations: { "x-opt-enqueued-time": Date.now() }
    }, (err) => {
        if (err) {
            console.error("Error al enviar el mensaje:", err);
        } else {
            console.log("Mensaje enviado correctamente:", content);
        }
    });
}
