import setFilePath from "~/helpers/upload/setFilePath";
import getRandom from "~/helpers/getRandom";

export default (newFilename: string, folder: string, forceName: string = ''): string => {

    let uploadedName: string;

    if(forceName){

        uploadedName = forceName

    }else{

        let ext: string = newFilename.substring(newFilename.lastIndexOf('.') + 1);

        let salt: string = (+new Date).toString(36).slice(-5) + getRandom(1000000, 0);

        uploadedName = Date.now() + salt + '.' + ext
    }

    return setFilePath(folder + uploadedName);

}


