import {addChampTourResults} from "~/helpers/remoteApi";


export default defineEventHandler(async (event) => {

    const {slug, api_id, current_tour} = await useBody(event);

    try {

        if(slug && api_id && current_tour){
            const results = await addChampTourResults(slug, api_id, current_tour);
            return {msg: 'success', results}
        }else{
            return {msg: 'error'}
        }


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
