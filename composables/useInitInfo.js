import {useState} from '#app';

export const useInitInfo = () => {

    return useState('initInfo', () => {

        return {}
    })

}
