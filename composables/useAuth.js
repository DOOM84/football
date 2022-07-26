import { useState } from '#app'

export const useAuth = () => {
    return useState('auth', () => false)
}