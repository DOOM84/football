import { Server } from 'socket.io';

let server = null

export default defineEventHandler(async (event) => {

    if (!server) {
        // @ts-expect-error: Nuxt3
        server = event.res.socket?.server
        const io = new Server(server);

        io.on("connection", function (socket) {

            //console.log("A user with ID: " + socket.id + " connected");

            /*socket.on("disconnect", function () {
                //console.log("A user with ID: " + socket.id + " disconnected");
                //io.emit("connections", io.engine.clientsCount);
            });*/

            /*socket.on("connect_error", (err) => {
                console.log(`connect_error due to ${err.message}`);
            });*/

            // More Socket listening here.

            //io.emit("connections", io.engine.clientsCount);

            socket.on("post-added", async (result) => {
                socket.broadcast.emit("add-post", result);
            });

            socket.on("tour-updated", async (result) => {
                socket.broadcast.emit("update-tour", result);
            });

            socket.on("ecup-updated", async (result) => {
                socket.broadcast.emit("update-ecup", result);
            });

            socket.on("comment-added", async (result) => {
                socket.broadcast.emit("add-comment", result);
            });


        });

    }

})