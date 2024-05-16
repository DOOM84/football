import type {IScore} from "~/types/interfaces";

export type adminMode = 'add'|'edit'|null;

export type result = Record<string | number, Record<string | number, IScore[]>>

