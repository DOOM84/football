import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
import uploadFile from "~/helpers/upload/uploadFile";
import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
import fs from "fs";
import setFilePath from "~/helpers/upload/setFilePath";
const db = getFirestore();

const schema = yup.object().shape(
    {
        added: yup.object().shape({
            name: yup.string('Название должно быть строкой')
                .trim('Введите название').required('Введите название'),
            champ: yup.string('Выберите чемпионат')
                .trim('Выберите чемпионат').required('Выберите чемпионат'),
            sprite: yup.string()
                .trim('Укажите координаты иконки в спрайте').required('Укажите координаты иконки в спрайте')
        })
    }
)


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

            if(added.api_id){added.api_id = +added.api_id}
            if(added.games){added.games = +added.games}
            if(added.win){added.win = +added.win}
            if(added.draw){added.draw = +added.draw}
            if(added.lost){added.lost = +added.lost}
            if(added.goals){added.goals = +added.goals}
            if(added.diff){added.diff = +added.diff}
            if(added.missed){added.missed = +added.missed}
            if(added.points){added.points = +added.points}

            if(files.file){

                if (fs.existsSync(setFilePath('/public' + added.img))) {
                    fs.unlinkSync(setFilePath('/public' + added.img));
                }

                const picPath = prepareFileInfo(files.file.newFilename, '/public/img/logos/');

                const {mainImage} =  await uploadFile(files.file, '/public/',  {
                    mainImage: true,
                    mainImagePath: picPath,
                    mainImageWidth: 151,
                    mainImageHeight: null,
                });

                added.img = mainImage.substring(mainImage.indexOf('/img'));
            }

            const champ = (await db.collection('champs').doc(added.champ).get()).data();

            const teams = champ.teams;

            const ind = champ.teams.findIndex((team)=> team.slug === added.slug)

            teams[ind] = {...teams[ind], ...added};

            await db.collection('champs').doc(added.champ).update({teams});

            return {result: added};

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