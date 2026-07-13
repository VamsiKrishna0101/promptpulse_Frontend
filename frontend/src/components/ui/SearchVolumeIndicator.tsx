import { useState } from 'react'

export function SearchVolumeIndicator({ volume = 3 }: { volume?: number }) {
    const [isHovered, setIsHovered] = useState(false)

    // Ensure volume is between 1 and 5
    const v = Math.max(1, Math.min(5, Math.round(volume)))

    return (
        <div 
            className="relative flex items-end gap-[3px] h-[16px] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className={`w-[4px] rounded-[1px] transition-colors ${i <= v ? 'bg-emerald-500' : 'bg-emerald-100'}`}
                    style={{ height: `${40 + (i * 15)}%` }}
                />
            ))}

            {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[340px] bg-[#222222] text-zinc-300 text-[12.5px] p-4 rounded-xl shadow-2xl z-50 pointer-events-none">
                    <div className="flex flex-col gap-2">
                        <div className={v === 1 ? "text-white font-medium" : ""}>1 - Very low search volume relative to your industry</div>
                        <div className={v === 2 ? "text-white font-medium" : ""}>2 - Low search volume relative to your industry</div>
                        <div className={v === 3 ? "text-white font-medium" : ""}>3 - Moderate search volume relative to your industry</div>
                        <div className={v === 4 ? "text-white font-medium" : ""}>4 - High search volume relative to your industry</div>
                        <div className={v === 5 ? "text-white font-medium" : ""}>5 - Very high search volume relative to your industry</div>
                    </div>
                </div>
            )}
        </div>
    )
}
