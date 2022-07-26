import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import slugify from "slugify";
import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
const db = getFirestore();
import uploadFile from "~/helpers/upload/uploadFile";
import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";

const schema = yup.object().shape(
    {
        added: yup.object().shape({
            title: yup.string('Название должно быть строкой')
                .trim('Введите название').required('Введите название'),

            subtitle: yup.string('Описание должно быть строкой')
                .trim('Введите описание').required('Введите описание'),

            body: yup.string('Текст должен быть строкой')
                .trim('Введите текст').required('Введите текст'),

            champ: yup.string('Чемпионат должен быть строкой').when('ecup', {
                is: value => !value,
                then: yup.string('Чемпионат должен быть строкой').nullable().required('Выберите чемпионат'),
                otherwise: yup.string('Чемпионат должен быть строкой').nullable(),
            }),

            ecup: yup.string('Еврокубок должен быть строкой').when('champ', {
                is: value => !value,
                then: yup.string('Еврокубок должен быть строкой').nullable().required('Выберите еврокубок'),
                otherwise: yup.string('Еврокубок должен быть строкой').nullable(),
            }),
        }, ['ecup', 'champ'])
    }
)

const fileSchema = yup.object().shape({
    file: yup.mixed().required('Выберите изображение'),
})


export default defineEventHandler(async (event) => {

    const form = formidable({
        encoding: 'utf-8',
        keepExtensions: true,
        // 2 mb for news image and attachments. override otherwise
        maxFileSize: 500 * 1024 * 1024,
        //multiples: true,
    });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    //const maxFileSize = 2000000;

    const {files, fields, err} = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {
            resolve({files: firstValues(form, files), fields: firstValues(form, fields), err})
        });
    })

    const added = JSON.parse(fields.data);

    if (err || (files.file && !allowedTypes.includes(files.file.mimetype))/*|| files.avatar.size > maxFileSize*/) {

        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Неверный тип или размер файла превышен'}));

    } else {

        try {

            await schema.validate({
                added,
            });

            await fileSchema.validate({
                file: files.file
            });

            const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
            const index = client.initIndex('posts');

            added.date = Date.now();

            added.slug = slugify(added.title, {strict: true, /*remove: /[*+~.()'"!:@]/g*/}).toLowerCase();

            added.id = added.slug;

            added.userRate = 0;

            const allTags = [];

            added.tags = await Promise.all(added.tags.map(async (tag) => {
                const tagsSnap = await db.collection('tags').doc(tag).get();
                if(!tagsSnap.exists){
                    const slug = slugify(tag, {strict: true, lower:true});

                    const newTag = {
                        name: tag,
                        slug: slug
                    }

                    allTags.push(newTag);

                    await db.collection('tags').doc(slug).set(newTag)

                    return slug;
                }

                return tag;

            }))


            if(files.file){

                const picPath = prepareFileInfo(files.file.newFilename, '/public/img/posts/');

                const {mainImage, thumbnail} =  await uploadFile(files.file, '/public/',  {
                    mainImage: true,
                    mainImagePath: picPath,
                    mainImageWidth: 800,
                    mainImageHeight: 446,
                    thumbnail: true,
                    thumbnailPath: prepareFileInfo(files.file,
                        '/public/img/posts/thumbnails/',
                        picPath.substring(picPath.lastIndexOf('/')+1)),
                    thumbnailWidth: 150,
                    thumbnailHeight: null,
                });

                added.images = {};

                added.images.original = mainImage.substring(mainImage.indexOf('/img'));

                added.images.thumbnail = thumbnail.substring(thumbnail.indexOf('/img'));
            }

            if(added.teams && added.teams.length){
                await Promise.all(added.teams.map(async (team) => {
                    const teamDoc = await db.collection('team_posts').doc(team).get();
                    if(teamDoc.exists){
                        const posts = teamDoc.data().posts;
                        posts.push(added.slug);
                        await db.collection('team_posts').doc(team).update(
                            {posts}
                        )
                    }else{
                        await db.collection('team_posts').doc(team).set(
                            {posts: [added.slug]}
                        )
                    }
                }))
            }

            if(added.players && added.players.length){
                await Promise.all(added.players.map(async (player) => {
                    const playerDoc = await db.collection('player_posts').doc(player).get();
                    if(playerDoc.exists){
                        const posts = playerDoc.data().posts;
                        posts.push(added.slug);
                        await db.collection('player_posts').doc(player).update(
                            {posts}
                        )
                    }else{
                        await db.collection('player_posts').doc(player).set(
                            {posts: [added.slug]}
                        )
                    }
                }))
            }

            if(added.tags && added.tags.length){
                await Promise.all(added.tags.map(async (tag) => {
                    const tagDoc = await db.collection('tag_posts').doc(tag).get();
                    if(tagDoc.exists){
                        const posts = tagDoc.data().posts;
                        posts.push(added.slug);
                        await db.collection('tag_posts').doc(tag).update(
                            {posts}
                        )
                    }else{
                        await db.collection('tag_posts').doc(tag).set(
                            {posts: [added.slug]}
                        )
                    }
                }))
            }

            await db.collection('posts').doc(added.slug).set(added);

            await index.saveObject({
                objectID: added.slug,
                ...added
            });

            return {
                result: added,
                allTags
            };

        } catch (e) {

           // console.log(e);

            if (e.path) {
                event.res.statusCode = 422;
                event.res.end(JSON.stringify({
                    msg: e.errors[0]
                }));

            } else {

                event.res.setHeader('Content-Type', 'application/json');
                event.res.statusCode = 401;
                event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));

            }
        }
    }

})