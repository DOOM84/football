import type {Ref} from "vue";
import type {IChampDB, IEcupDB} from "~/types/interfaces";
export const useCups = (): Ref<{'champs': IChampDB[] | []; 'ecups': IEcupDB[] | []}> => {
    return useState('cups', () => ({champs: [], ecups: []}))
}


/*
export const useCups = async () => {
        const { data } = await useFetch('/api/init');
        return {champs: data.value?.champs || [], ecups: data.value?.ecups || []}
    }*/
