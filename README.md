# EventMesh-amqp-node

Este proyecto contiene scripts en JavaScript que interactúan con SAP Event Mesh utilizando la biblioteca `@sap/xb-msg` para la mensajería. Hay dos scripts: uno para recibir mensajes de una cola y otro para enviar mensajes a un tema específico. Ambos scripts requieren autenticación mediante un token de acceso, que se obtiene de un servidor de autenticación utilizando las credenciales de cliente proporcionadas.

## Requisitos Previos

Antes de ejecutar los scripts, asegúrate de tener instalados los siguientes requisitos:

- Asegúrate de tener instalado Node.js en tu sistema..
- Este proyecto utiliza la biblioteca `@sap/xb-msg` para interactuar con SAP Event Mesh.
- Debes configurar un archivo .env en la raíz del proyecto con las siguientes variables:
```java
eventMeshUrl = ... // URL del servidor EventMesh
queueName = ... // Nombre de la cola
topicName = ... // Nombre del tópico
tokenEndpoint = ... // Endpoint para obtener el token
clientId = ... // ID del cliente
clientSecret = ... // Secreto del cliente
```

## Ejecución
### receiveMessage.js
Este script se encarga de recibir mensajes de una cola utilizando un cliente de mensajería. Se conecta a SAP Event Mesh y se suscribe a una cola. Los mensajes recibidos se procesan y se manejan los errores de manera apropiada.

### sendMessage.js
Este script permite enviar mensajes a SAP Event Mesh. Al conectarse, envía un mensaje específico a un stream de salida y maneja la conexión adecuadamente.
