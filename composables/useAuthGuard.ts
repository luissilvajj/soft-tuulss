export const useAuthGuard = () => {
    const user = useSupabaseUser()
    const router = useRouter()

    // Watch user state
    watch(user, (curr, prev) => {
        if (!curr) {
            router.push('/login')
        }
    })

    // Check on init
    onMounted(() => {
        if (!user.value) {
            router.push('/login')
        }
    })
}
