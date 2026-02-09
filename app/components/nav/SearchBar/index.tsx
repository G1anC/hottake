import Image from 'next/image';
import { useSearchBar } from './hook';

const NavSearchBar = () => {

    const { artistResults, albumResults, text, handleInputChange } = useSearchBar();

    const ResultList = () => {
        return (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12 mt-4 bg-[#181819] rounded-lg shadow-lg z-50">
                {Array.from(artistResults).slice(0,2).map((result, index) => (
                    <a key={index} href={`/artist/${result.mbid}`} className="block px-8 py-4 hover:bg-[#282829]">
                        <p className="text-white text-[12px]">{result.name}</p>
                    </a> 
                ))}
                {Array.from(albumResults).slice(0, 5).map((result, index) => (
                    <a key={index} href={`/album/${result.mbid}`} className="block px-8 py-3 hover:bg-[#282829]">
                        <span className="flex gap-4 shrink-0 items-center">
                            {result.image.length > 0 && 
                            result.image[0]['#text'] !== "" &&
                            <Image
                                src={result.image[0]['#text']}
                                width={24}
                                height={24}
                                className='rounded-sm'
                                alt="Album Art"
                            />}
                            <p className="text-white text-[12px]">{result.name}</p>
                            <p className="text-white/50 text-[12px]">by {result.artist}</p>
                        </span>
                    </a>
                ))}
            </div>
        );
    }

    return (<>
        <div className="flex justify-center absolute left-1/2 transform -translate-x-1/2 items-center">
                <div className="relative w-80 rounded-lg bg-[#181819]">
                    <input
                        autoComplete='off'
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/10"
                        name="name"
                        value={text.name}
                        onChange={handleInputChange}
                    >
                    </input>
                    <button onClick={() => text.name = ""} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white">
                        <Image src="/cross.svg" alt="Clear search" width={48} height={48} />
                    </button>
                </div>
            </div>

        <ResultList />
    </>)
};

export default NavSearchBar;
