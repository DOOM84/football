import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
import sharp from "sharp";
import setFilePath from "~/helpers/upload/setFilePath";
import fs from "fs";

export class Upload {
    private files: File[];
    private toDel?: string | string[];
    private resizeOpts?: Record<string, any>;
    private dest: string;
    private thumbs?: {dest: string, resizeOpts?: Record<string, any>}[]

    constructor(files: File[], dest: string,
                toDel?: string | string[],
                resizeOpts?: Record<string, any>,
                thumbs?: {dest: string, resizeOpts?: Record<string, any>}[]) {
        this.files = files;
        this.toDel = toDel;
        this.dest = dest;
        this.thumbs = thumbs;
        this.resizeOpts = resizeOpts;

        if (this.files && files.length > 0) {
            if (this.toDel) {
                if (Array.isArray(this.toDel)) {
                    for (let i = 0; i < this.toDel.length; i++) {
                        if (fs.existsSync(setFilePath('/public' + this.toDel[i]))) {
                            fs.unlinkSync(setFilePath('/public' + this.toDel[i]));
                        }
                    }
                } else {
                    if (fs.existsSync(setFilePath('/public' + this.toDel))) {
                        fs.unlinkSync(setFilePath('/public' + this.toDel));
                    }
                }
            }
        } else {
            throw createError({
                statusCode: 404,
                message: 'No file'
            })
        }
    }

    async uploadFile() {

        const uploads = this.files.map((file: Record<string, any>) => {

            return new Promise(async (resolve, reject) => {
                try {
                    const origFileName: string = file.originalFilename;

                    const ext: string = origFileName.substring(origFileName.lastIndexOf('.') + 1);

                    const fileName: string = Date.now().toString() + '.' + ext; // fields.name.split(' ').join('_')+'.'+ext;

                    const oldPath = file.filepath;

                    const newOrigPath = prepareFileInfo(fileName, `/public${this.dest}`);

                    const newPath: string = this.dest + newOrigPath.substring(newOrigPath.lastIndexOf('/') + 1);

                    const stream = fs.createReadStream(oldPath);

                    stream.on('open', async () => {

                        const origStream = fs.createWriteStream(newOrigPath);

                        if (this.resizeOpts || file.mimetype.includes('image')) {

                            const resizeOrig = this.resizeOpts || {};

                            const transformerOrig = sharp()
                                .resize(resizeOrig);

                            stream
                                .pipe(transformerOrig)
                                .pipe(origStream);

                            if(this.thumbs && this.thumbs.length){
                                const thumbsToUpload = this.thumbs.map((thumb) => {
                                    return new Promise(async (resolve, reject) => {
                                        const origThumbStream = fs.createWriteStream(prepareFileInfo(fileName, `/public${thumb.dest}`, newOrigPath.substring(newOrigPath.lastIndexOf('/') + 1)));

                                        const resizeThumb = thumb.resizeOpts || {};

                                        const transformerThumbOrig = sharp()
                                            .resize(resizeThumb);

                                        stream
                                            .pipe(transformerThumbOrig)
                                            .pipe(origThumbStream);
                                    })
                                })
                                await Promise.all(thumbsToUpload)
                            }

                        } else {
                            stream
                                .pipe(origStream);
                        }

                    })

                    /*stream.on('end', () => {
                        console.log('finished');
                    })*/

                    resolve(newPath);

                } catch (e) {
                    console.log(e);
                    reject(e)
                }
            })
        });

        const updRes = await Promise.all(uploads) as string[];

        /*const updRes = Promise.all(uploads.map((p: Promise<any>) => p.catch(e => e)))
            .then(results => {
                console.log(results);
                return  results
            }) // 1,Error: 2,3
            .catch(e => console.log(e));*/

        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            paths: updRes,
            // ...this.fields
        }
        /*.then((values) => {
            console.log(values);
        });*/
    }
}