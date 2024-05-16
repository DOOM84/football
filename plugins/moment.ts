import moment from 'moment/min/moment-with-locales.js';
import tz from "~/helpers/tz";


export default defineNuxtPlugin(nuxtApp => {
    prepareLocale();

    return {
        provide: {
            showDateHuman: (stamp: number) => {
                // prepareLocale();
                return moment(stamp).fromNow()
            },
            showDate: (stamp: number) => {
                // prepareLocale();
                return moment(stamp).format('Do MMMM YYYY HH:mm')
            },
            postDate: (stamp: number) => {
                // prepareLocale();
                return moment(stamp).format('DD MMMM YYYY')
            },
            singlePostDate:  (stamp: number) => {
                // prepareLocale();
                return moment(stamp).format('DD MMMM YYYY, HH:mm')
            },
            matchTime:  (stamp: number) => {

                const year = new Date(stamp).getFullYear();

                const summerTime = Date.parse(lastSunday(year, 3));
                const winterTime = Date.parse(lastSunday(year, 10));

                const tZone = (stamp > summerTime && stamp < winterTime) ? 3 : 2;

                return moment(stamp).utcOffset(tZone).format('HH:mm')
            },
            resultDate:  (stamp: number) => {
                //prepareLocale();
                return moment(stamp).format('DD-MM-YYYY')
            },
            convDate:  (str: string) => {

                return moment(str, 'DD MMM YYYY').unix()
            },
            diffDate:  (stamp: number) => {
                //  prepareLocale();

                const now = moment(Date.now()).utcOffset(tz);
                const end = moment(stamp).local().add(115, 'minutes');

                return moment.duration(end.diff(now)).asMinutes();
            }
        }
    }
})

function prepareLocale(): void {
    moment.locale('ru');
}

function lastSunday(year: number, month: number): string {
    const date = new Date(year,month,1,12);
    let weekday = date.getDay();
    let dayDiff = weekday===0 ? 7 : weekday;
    let lastSunday = date.setDate(date.getDate() - dayDiff);
    return date.toDateString();
}
