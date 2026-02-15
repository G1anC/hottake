import Api from "../../../api/api";
import { Review } from "@prisma/client";
import { EuropaBold } from "@/app/lib/loadFont";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import UserPicture from "@/app/components/UserPicture";
import Image from "next/image";
import { Stat } from "@/app/components/stats";
import { NoteDisplay } from "@/app/components/note";
import { starColors } from "@/app/components/starColors";
import { EuropaRegular } from "@/app/lib/loadFont";

const getServerSession = async () => {
	return auth.api.getSession({
		headers: await headers(),
	});
};

export default async function UserProfile() {
	const api = new Api("http://localhost:3000/api");

	const session = await getServerSession();

	if (!session?.user || !session)
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<p className="text-white text-2xl">
					You must be logged in to view this page.
				</p>
			</div>
		);

	const getBackgroundImageSrc = () => {
		if (!session || !session.user || !session?.user.image) {
			return "https://picsum.photos/1920/400";
		}

		try {
			const imageData = JSON.parse(session.user.image);
			return `data:${imageData.type};base64,${imageData.data}`;
		} catch {
			return "https://picsum.photos/1920/400";
		}
	};

	const backgroundImageSrc = getBackgroundImageSrc();
	let imagesFromAlbums: string[] = [];
	let reviews: Review[] = [];

	const listenedAlbums = await Promise.all(
		(session.user.listened || []).map(async (albumMbid: string) => {
			try {
				const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body;
				return album;
			} catch (error) {
				return null;
			}
		}),
	);

	const bigFiveAlbums = await Promise.all(
		(session.user.listened || []).map(async (albumMbid: string) => {
			try {
				const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body;
				return album;
			} catch (error) {
				return null;
			}
		})
	);

	const nextListAlbums = await Promise.all(
		(session.user.nextList || []).map(async (albumMbid: string) => {
			try {
				const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body;
				return album;
			} catch (error) {
				return null;
			}
		}),
	);

	const hotTakesAlbums = await Promise.all(
		(session.user.hotTakes || []).map(async (albumMbid: string) => {
			try {
				const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body;
				return album;
			} catch (error) {
				return null;
			}
		}),
	);

	if (session?.user?.reviews) {
		reviews = session.user.reviews;

		const images = await Promise.all(
			reviews.map(async (review: Review) => {
				try {
					const album = (await api.lastfm.getAlbumInfoByMbid(review.mbid)).body;
					if (!album || !album.image || album.image.length === 0) {
						return null;
					}
					const image = album.image[album.image.length - 1]["#text"];
					return image;
				} catch (error) {
					return null;
				}
			}),
		);
		imagesFromAlbums = images.filter((img) => img !== null) as string[];
	}



	const Reviews = async ({ reviews }: { reviews: Review[] }) => {
		return (
			<div className="w-full h-full flex flex-col min-h-0">
				<h3 className="text-2xl font-bold mb-4 shrink-0">Reviews</h3>
				<div className="flex-1 overflow-y-auto space-y-12 min-h-0 pr-16">
					{reviews.length > 0 ? (
						reviews.map(async (review, index) => {
							console.log('note:', review.note, 'color:', starColors[0])

							const albumInfoFinder = async () => {
								try {
									const album = (await api.lastfm.getAlbumInfoByMbid(review.mbid)).body;
									return album;
								} catch (error) {
									return null;
								}
							}
							const album = await albumInfoFinder()
							if (!album)
								return
							return (
								<div key={index} className="">
									<div className="flex justify-between">
										<div className="flex gap-8 items-start">
											<Image alt={"albumCover"} src={imagesFromAlbums[index]} width={100} height={100} />
											<div className="">
												<div className="flex items-center gap-8">
													<h4 className="font-semibold mb-2">{album.name}</h4>
													<h4 className="text-white/50 text-md mb-2">{album.artist}</h4>
												</div>
												<p className="text-[12px] mt-2 text-white/50">{review.content}</p>
											</div>
										</div>
										<div
											style={{
												color: starColors[review.note - 1],
												backgroundColor: starColors[review.note - 1] + "09",
												borderColor: starColors[review.note - 1] + "09",
												border: "1px solid",
												borderRadius: 8
											}}
											className="flex gap-3 sm:gap-4 md:gap-6 h-fit py-3 px-6 shrink-0 text-base sm:text-md md:text-md items-center min-w-0"
										>
											<div className="flex-1 min-w-0">
												<NoteDisplay note={review.note} />
											</div>
											<div
												className="shrink-0 text-3xl"
												style={{ color: `${starColors[review.note - 1]}` }}

												>
												{(review.note / 2).toFixed(1)}
											</div>
										</div>
									</div>
								</div>
							)
						}
						)) : (
						<p>No reviews available.</p>
					)}
				</div>
			</div>
		);
	};



	return (
		<div className={`h-screen text-white w-screen overflow-hidden ${EuropaRegular.className} tracking-wider`}>
			<div className="h-full flex flex-col relative">
				<div className="h-[20vh] w-full backdrop-blur-[150px] overflow-hidden shrink-0" />
				<Image
					src={backgroundImageSrc}
					alt="background"
					fill
					unoptimized
					className="object-cover absolute h-[20vh] w-full -z-10"
				/>

				<div className="flex-1 bg-[#0c0c0e] flex flex-col w-full px-48 pb-8 items-center overflow-hidden z-10 min-h-0">
					<div className="w-full z-50 mt-8 flex absolute top-0 px-48 justify-center shrink-0 gap-2">
						{bigFiveAlbums.slice(0, 5).map((album, index) => {
							if (!album) return;
							return (
								<img
									className="aspect-square z-50 w-full rounded-lg"
									src={album.image[album.image.length - 1]["#text"]}
									key={index}
								/>
							);
						})}
					</div>

					<div className="w-full flex justify-between space-x-8 pt-64 shrink-0">
						<div className="flex items-start space-x-8">
							<UserPicture
								userId={session.user.id}
								b64Image={session.user.image}
							/>
							<div className="">
								<h1 className={`text-7xl font-bold ${EuropaBold.className}`}>
									{session?.user?.username}
								</h1>
								<p className="opacity-50 mt-4">{session?.user?.bio}</p>
							</div>
						</div>

						<div className="flex gap-32">
							<Stat label="Member since" value={(new Date(session?.user?.createdAt)).toDateString()} />
							<Stat label="Reviews" value={reviews.length} />
						</div>
					</div>

					<div className="flex-1 w-full flex gap-40 mt-12 overflow-hidden min-h-0">
						<div className="flex-1 h-full min-h-0 pb-16">
							<Reviews reviews={reviews} />
						</div>



						<div className="h-full overflow-y-auto pb-12 flex flex-col gap-8">
							<a href={'/profile/tierlist/'} >yeah</a>
							<div className="">
								<div className="w-full flex justify-between">
									<p className="">Listened</p>
									<button className="text-white/50 hover:text-white">
										More
									</button>
								</div>
								<div className="w-full mt-2 flex space-x-1">
									{listenedAlbums.slice(0, 5).map((album, index: number) =>
										album ? (
											<a href={album.mbid} key={index} className="">
												<img
													src={
														album?.image?.[album.image.length - 1]?.["#text"]
													}
													alt="Album Art"
													width="90"
													className="rounded-xs"
												/>
											</a>
										) : null,
									)}
								</div>
							</div>

							<div className="">
								<div className="w-full flex justify-between">
									<p className="">Hottakes</p>
									<button className="text-white/50 hover:text-white">
										More
									</button>
								</div>
								<div className="w-full mt-2 flex space-x-1">
									{hotTakesAlbums.slice(0, 5).map((album, index: number) =>
										album ? (
											<a href={album.mbid} key={index} className="">
												<img
													src={
														album?.image?.[album.image.length - 1]?.["#text"]
													}
													alt="Album Art"
													width="90"
													className="rounded-xs"
												/>
											</a>
										) : null,
									)}
								</div>
							</div>
							<div className="">
								<div className="w-full flex justify-between">
									<p className="">Nextlist</p>
									<button className="text-white/50 hover:text-white">
										More
									</button>
								</div>
								<div className="w-full mt-2 flex space-x-1">
									{nextListAlbums.slice(0, 5).map((album, index: number) =>
										album ? (
											<a href={album.mbid} className="">
												<img
													src={
														album?.image?.[album.image.length - 1]?.["#text"]
													}
													alt="Album Art"
													width="90"
													className="rounded-xs"
												/>
											</a>
										) : null,
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}