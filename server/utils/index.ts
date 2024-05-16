import { Server, type ServerOptions, type Socket } from 'socket.io'
import type { H3Event } from 'h3'

const options: Partial<ServerOptions> = {
    path: '/api/socket.io',
    serveClient: false
}

export const io = new Server(options);
export function initSocket(event: H3Event) {
    // @ts-ignore
    io.attach(event.node.res.socket?.server);

    io.on('connection', (socket: Socket) => {

        socket.on('joinRoom', (room) => {
            socket.join(room);
        })

        socket.on('comment', (payload: { newComment: Record<string, any>, room: string }) => {
            io.to(payload.room).emit('comment-post', payload.newComment)
          //  socket.broadcast.emit("comment-game", payload.newComment);
        })

        socket.on("post-added",  (payload) => {
            //socket.broadcast.emit("add-post", result);
            io.to(['main', 'news', 'champ-post', 'champ-calendar', 'champ',
                'champ-stands', 'ecup-post', 'ecup-calendar',
                'ecup', 'ecup-stands']).emit('add-post', payload)
        });

        socket.on("tour-updated", (payload) => {
           // socket.broadcast.emit("update-tour", result);
            io.to(['main', 'champ-calendar', 'champ']).emit('update-tour', payload)
        });

        socket.on("ecup-updated",  (result) => {
            io.to(['ecup-post', 'ecup-calendar', 'ecup']).emit('update-ecup', result);
            //socket.broadcast.emit("update-ecup", result);
        });

        socket.on("live-results",  () => {
            io.to(['main', 'champ-post', 'champ', 'ecup', 'match']).emit('results-live')
           // socket.broadcast.emit("results-live");
        });

        /*socket.on("disconnect", () => {
            console.log(socket.rooms.size);
        });*/
    })

}
