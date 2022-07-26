import database from '~/helpers/dbConn';
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import * as serviceAccount from "../../helpers/football-9a828-firebase-adminsdk-6wyao-c55b426330.json";

const apps = getApps();

if (!apps.length) {
    initializeApp({
        credential: cert(serviceAccount)
    })
}
database();

export default defineEventHandler(async (event) => {

    const toName = event.req.originalUrl.split("/");

    if (toName[2] === 'admin' && (toName[3] === 'add' ||
        toName[toName.length - 1] === 'edit' || toName[toName.length - 1] === 'remove'
        || toName[toName.length - 1] === 'removeImg'
        || toName[toName.length - 1] === 'load_players'
        || toName[toName.length - 1] === 'comdel'
        || toName[toName.length - 1] === 'add_squad'
        || toName[toName.length - 1] === 'add_player_info'
        || toName[toName.length - 1] === 'player_slug'
        || toName[toName.length - 1] === 'remove_player'
        || toName[toName.length - 1] === 'squad'
        || toName[toName.length - 1] === 'uploader'
    )) {

        try {
            const {access} = await $fetch('/api/auth/check', {params: {token: useCookies(event).token}});

            if (!access) {
                await Promise.reject(Error('No access'));
            }

        } catch (e) {

            event.res.writeHead(403, {
                "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
            });

            event.res.end(JSON.stringify({msg: 'no or expired token'}));
        }
    }

})
