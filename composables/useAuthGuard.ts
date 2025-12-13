export const useAuthGuard = () => {
    const user = useSupabaseUser()
    const router = useRouter()

    watchEffect(() => {
        if (!user.value) {
            // Check if we are potentially hydrating?
            // Actually, for client-side only (ssr: false), useSupabaseUser should sync with local storage.
            // But we can add a small delay or check session explicitly.
            router.push('/login')
        }
    })
}
