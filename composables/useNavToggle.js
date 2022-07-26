import { useState } from '#app';

export const useNavToggle = () => {
    return useState('navToggle ', () => false)
}