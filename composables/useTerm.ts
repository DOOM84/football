export const useTerm = (): Ref<string | null> => {
    return useState('term', () => null)
}