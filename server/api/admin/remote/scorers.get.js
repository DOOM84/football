import {addChampsScorers} from "~/helpers/remoteApi";


export default defineEventHandler(async (event) => {

    try {
        await addChampsScorers();
        return {msg: 'success'}

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

})
