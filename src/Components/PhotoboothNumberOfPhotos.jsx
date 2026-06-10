function PhotoboothNumberOfPhotos({
  selectedShotCount,
  setSelectedShotCount,
  isDisabled = false,
}) {
  const shotCounts = [1, 2, 3, 4];

  const handleSelectShotCount = (count) => {
    if (isDisabled || selectedShotCount === count) return;
    setSelectedShotCount?.(count);
  };

  return (
    <div className="w-full">
      <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#1D56CF] sm:mb-3 sm:text-xs sm:tracking-wider">
        Number of photos
      </p>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {shotCounts.map((count) => {
          const isSelected = Number(selectedShotCount) === count;

          return (
            <button
              key={count}
              type="button"
              onClick={() => handleSelectShotCount(count)}
              disabled={isDisabled}
              className={`group relative flex h-11 items-center justify-center overflow-hidden rounded-xl border-2 border-[#05102D] text-lg font-black transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:translate-y-1 active:scale-95 active:shadow-none sm:h-14 sm:rounded-2xl sm:text-xl ${
                isSelected
                  ? 'bg-[#1D56CF] text-[#FDF9F2] shadow-[2px_3px_0_#05102D] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] md:animate-number-choice-pop sm:shadow-[4px_5px_0_#05102D] sm:ring-offset-2 md:hover:-translate-y-1'
                  : 'bg-[#FDF9F2] text-[#05102D] md:hover:-translate-y-1 md:hover:rotate-[-1deg] md:hover:bg-[#1D56CF] md:hover:text-[#FDF9F2] md:hover:shadow-[3px_4px_0_#05102D]'
              } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              aria-label={`Use ${count} ${count === 1 ? 'photo' : 'photos'}`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <span className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[inherit] md:block">
                  <span className="absolute inset-y-0 left-[-60%] h-full w-[45%] animate-number-shine bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </span>
              )}

              <span className="relative z-10 transition-transform duration-150 group-active:scale-110 md:group-hover:scale-110">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes numberChoicePop {
          0% {
            transform: scale(0.94) rotate(-1deg);
          }

          55% {
            transform: scale(1.06) rotate(1deg);
          }

          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes numberShine {
          0% {
            transform: translateX(0) skewX(-14deg);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          58% {
            opacity: 1;
          }

          100% {
            transform: translateX(355%) skewX(-14deg);
            opacity: 0;
          }
        }

        .animate-number-choice-pop {
          animation: numberChoicePop 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-number-shine {
          animation: numberShine 1.1s ease-in-out 2;
        }

        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .animate-number-choice-pop,
          .animate-number-shine {
            animation: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-number-choice-pop,
          .animate-number-shine {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PhotoboothNumberOfPhotos;