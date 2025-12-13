export const useAuthGuard = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    const router = useRouter()

    onMounted(async () => {
        // Wait for potential session restoration
        const { data: { session } } = await client.auth.getSession()

        if (!session && !user.value) {
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
