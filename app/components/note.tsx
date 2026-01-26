'use client'

import React from 'react'

const starColors = [
    '#6C82DD', 
    '#659CE3',
    '#67BBDA',
    '#2CE0A1',
    '#77E06D',
    '#DFD561',
    '#E5A360',
    '#E5845A',
    '#E46E5E',
    '#E3545A', 
]

const NoteSetter = ({note, setNote}: {note: number, setNote: React.Dispatch<React.SetStateAction<number>>}) => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    
    const getStarColor = (starIndex: number, isRightHalf: boolean) => {
        const activeIndex = hoveredIndex !== null ? hoveredIndex : note;
        
        if (activeIndex === null)
            return '#ffffff33'; 
        return starColors[activeIndex];
    };
    
    const getStarOpacity = (starIndex: number, isRightHalf: boolean) => {
        const activeIndex = hoveredIndex !== null ? hoveredIndex : note;
        const currentColorIndex = starIndex * 2 + (isRightHalf ? 1 : 0);
        
        if (activeIndex === null)
            return 1;
        if (currentColorIndex <= activeIndex)
            return 1;
        return 0.5;
    };
    
    const handleStarHover = (starIndex: number, isRightHalf: boolean) => {
        const colorIndex = starIndex * 2 + (isRightHalf ? 1 : 0);
        setHoveredIndex(colorIndex);
    };
    
    const handleStarClick = (starIndex: number, isRightHalf: boolean) => {
        const colorIndex = starIndex * 2 + (isRightHalf ? 1 : 0);
        setNote(colorIndex);
    };
    
    return (
        <div className="flex">
            {[0, 1, 2, 3, 4].map((starIndex) => (
                <div 
                    key={starIndex}
                    className="relative px-1 cursor-pointer"
                    style={{ width: 24, height: 24 }}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <div 
                        className="absolute inset-0"
                        style={{ 
                            clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
                            opacity: getStarOpacity(starIndex, false),
                            backgroundColor: getStarColor(starIndex, false),
                            WebkitMaskImage: 'url(/star.svg)',
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: 'url(/star.svg)',
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center'
                        }}
                        onMouseEnter={() => handleStarHover(starIndex, false)}
                        onClick={() => handleStarClick(starIndex, false)}
                    />
                    <div 
                        className="absolute inset-0"
                        style={{ 
                            clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
                            opacity: getStarOpacity(starIndex, true),
                            backgroundColor: getStarColor(starIndex, true),
                            WebkitMaskImage: 'url(/star.svg)',
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: 'url(/star.svg)',
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center'
                        }}
                        onMouseEnter={() => handleStarHover(starIndex, true)}
                        onClick={() => handleStarClick(starIndex, true)}
                    />
                </div>
            ))}
        </div>
    )
}

export default NoteSetter