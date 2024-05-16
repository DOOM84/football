import { ref } from "vue";
import type {adminMode} from "~/types/types";

export default function () {

    const filtering = ref<string[]>([]);
    const toFilter = ref<boolean>(false);
    const showDlg = ref<boolean>(false);
    const mode = ref<adminMode>(null);

    const filter = function filter(fTerm: string, dir: string): void{
        filtering.value = [fTerm, dir]
        toFilter.value = true;
    }

    return {
        filtering,
        toFilter,
        showDlg,
        mode,
        filter
    }
}