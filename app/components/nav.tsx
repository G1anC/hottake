

const Nav = () => {
    return (
        <nav className="w-full bg-gray-800 px-16 py-28 text-white">
            <ul className="flex space-x-4">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/discover" className="hover:underline">Discover</a></li>
                <li><a href="/profile" className="hover:underline">Profile</a></li>
                <li><a href="/login" className="hover:underline">Login</a></li>
            </ul>
        </nav>
    );
}

export default Nav;