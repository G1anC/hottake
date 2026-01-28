export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className=" h-screen text-white w-screen text-sm flex flex-col relative">
			<div className="h-full w-full backdrop-blur-[150px] z-10 overflow-hidden" />
			<div
				style={{
					backgroundImage: `url('/cocteauBackground.png')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					filter: 'blur(100px)',
					zIndex: -1,
				}} className="absolute top-0 left-0 h-1/2 w-full"
			/>
			<div className="w-full bg-[#0c0c0e] h-full"></div>
			<div className="absolute left-1/2 top-1/2 w-[550px] bg-[#181819] rounded-lg transform z-20 -translate-1/2 px-16 py-16">
				{children}
			</div>
		</div>
    )
}
