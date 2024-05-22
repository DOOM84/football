import type {Ref} from "vue";
import type {IChamp, IEcup} from "~/types/interfaces";
export const useCups = (): Ref<{'champs': IChamp[] | []; 'ecups': IEcup[] | []}> => {
    return useState('cups', () => ({champs: [], ecups: []}))
}
