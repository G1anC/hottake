import { createAuthClient } from "better-auth/react";
import { usernameClient, customSessionClient } from "better-auth/client/plugins"
import { auth } from "./auth";

const authClient = createAuthClient({
    plugins: [usernameClient(), customSessionClient<typeof auth>()],
});
const { signIn, signUp, signOut, useSession } = authClient;

export { signIn, signUp, signOut, useSession, authClient };
