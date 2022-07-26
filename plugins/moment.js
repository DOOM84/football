import {defineNuxtPlugin} from '#app'
import moment from 'moment/min/moment-with-locales.js';


export default defineNuxtPlugin(nuxtApp => {

    nuxtApp.provide('showDateHuman', (stamp) => {
        prepareLocale();
        return moment(stamp).fromNow()
    })

    nuxtApp.provide('showDate', (stamp) => {
        prepareLocale();
        return moment(stamp).format('Do MMMM YYYY HH:mm')
    })

    nuxtApp.provide('postDate', (stamp) => {
        prepareLocale();
        return moment(stamp).format('DD MMM YYYY')
    })

    nuxtApp.provide('singlePostDate', (stamp) => {
        prepareLocale();
        return moment(stamp).format('DD MMMM YYYY, HH:mm')
    })

    nuxtApp.provide('resultDate', (stamp) => {
        prepareLocale();
        return moment(stamp).format('DD-MM-YYYY')
    })

    nuxtApp.provide('convDate', (str) => {

        prepareLocale();

        return moment(str, 'DD MMM YYYY').unix()
    })

    nuxtApp.provide('diffDate', (stamp) => {
        prepareLocale();

        const now = moment(Date.now());
        const end = moment(stamp).add(115, 'minutes');

        return moment.duration(end.diff(now)).asMinutes();
    })


    //nuxtApp.provide('showAge', () =>  {return moment().diff('1984-06-07', 'years')})

    //console.log(moment(1454521239279).format('12 MMM YYYY'));
    //console.log(moment(1454521239279).format('dd MMM yyyy HH:mm'));
    //console.log(moment(1636718466772).fromNow());


})

function prepareLocale() {
    /*let loc = useState('locale').value;
    if (loc === 'ua') {
        loc = 'uk'
    }*/
    moment.locale('ru');
    //return moment(stamp).fromNow()
}
