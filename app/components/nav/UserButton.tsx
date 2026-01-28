import { useSession, signOut } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button, DropdownMenu } from "@radix-ui/themes";

const UserButton = () => {

    const { data: session } = useSession();
    const router = useRouter();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <button className="hover:underline relative w-10 rounded-full h-10 overflow-hidden bg-white/5 flex items-center justify-center hover:bg-white/10">
                    <img src="/noUser.svg" className="w-full h-full" />
                </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Content
            
            className="!bg-[#181819] text-white rounded-lg z-50 !p-0 mt-2 min-w-[150px]">
                {!session ? (
                    <DropdownMenu.Item 
                        onClick={() => {
                            router.push('/login');
                        }}
                        className="py-2 text-left flex gap-1 hover:bg-white/5 px-6 rounded-t-lg">
                        Login
                        <p className="text-white/50">or</p>
                        register
                    </DropdownMenu.Item> )
                : 
                    <div>
                        <DropdownMenu.Item
                            onClick={() => {
                                router.push('/account');
                            }}
                            className="py-2 px-6 text-left rounded-t-lg hover:bg-white/5 text-white">
                            Account
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            onClick={() => {
                                router.push('/settings');
                            }}
                            className="py-2 px-6 text-left rounded-t-lg hover:bg-white/5 text-white">
                            Settings
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            onClick={() => {
                                signOut();
                            }}
                            className="py-2 text-left px-6 !bg-red-400/5 !text-red-400 hover:!bg-red-400/10 rounded-b-lg">
                            Log out
                        </DropdownMenu.Item>
                    </div>
                }
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

export default UserButton;