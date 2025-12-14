export const useAuthGuard = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    const router = useRouter()

    onMounted(async () => {
        try {
            // Wait for potential session restoration
            const { data, error } = await client.auth.getSession()

            if (error) {
                console.error('Session error, clearing:', error)
                // Force sign out to clear bad tokens causing infinite refresh loops
                await client.auth.signOut()
                router.push('/login')
                return
            }

            if (!data.session && !user.value) {
                router.push('/login')
            }
        } catch (e) {
            console.error('Auth Guard Exception:', e)
            router.push('/login')
        }
    })

    // Watch for explicit sign out
    watch(user, (curr) => {
        if (!curr) {
            router.push('/login')
        }
    })
}
