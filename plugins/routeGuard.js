
export default defineNuxtPlugin(async ({ssrContext, $logOut}) => {
    const router = useRouter();
    const isLoggedIn = useIsloggedIn();
    const user = useUserInfo();
    const isAdmin = useUserAdmin();
    const authToken = useTokenAuth();

    if (process.server && ssrContext) {

        const {res, url} = ssrContext;

        const {path} = router.resolve(url);

        const toName = path.split("/");

        try {

            if ((toName[1] === 'admin')) {

                try {
                    const {access} = await $fetch('/api/auth/check', {
                        headers: useRequestHeaders(["cookie"]),
                    });

                    if (!access) {
                        await Promise.reject(Error());
                    } else {
                        isAdmin.value = true;
                        await getUser(isLoggedIn, user);
                    }

                } catch (e) {
                    res.writeHead(302, {Location: '/404'});
                    res.end();
                    //console.log(e);
                }
            }else {
                await getUser(isLoggedIn, user);
            }

        }catch (e) {
           // $logOut();
        }

    } else if (process.client) {
        router.beforeEach(async (to, from, next) => {

            const toName = to.path.split("/");

            if ((toName[1] === 'admin')) {
                try {
                    if (!authToken.value) {
                        $logOut();
                        return next('/404');
                    }

                    const {access} = await $fetch('/api/auth/check')

                    if (!access) {
                        $logOut();
                        return next('/404');
                    } else {
                        isAdmin.value = true;
                        return next()
                    }

                } catch (e) {
                    $logOut();
                    return next('/404');
                    //console.log(e);
                }
            }

            return next();

        });
    }
});

async function getUser(isLoggedIn, user){

    const data = await $fetch('/api/auth/user', {
        headers: useRequestHeaders(["cookie"]),
    });

    if (data) {
        isLoggedIn.value = true;
        user.value = {
            name: data.login,
            avatar: data.avatar
        };
    }
}
