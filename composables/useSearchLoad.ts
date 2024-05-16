export const useSearchLoad = (): Ref<boolean> => {
    return useState('searchLoad', () => false)
}