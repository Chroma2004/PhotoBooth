import classicIcon from '../assets/Shine.png';
import blackWhiteIcon from '../assets/BLack&White.png';
import oldFilmIcon from '../assets/Filter.png';
import dreamGlowIcon from '../assets/SoftGlow.png';
import thermalIcon from '../assets/Thermal.png';
import pixelBoothIcon from '../assets/Pixel.png';
import ditherIcon from '../assets/Dither.png';
import surveillanceIcon from '../assets/CCTV.png';
import vintageBlueIcon from '../assets/Shutter.png';
import badingIcon from '../assets/Rainbow.png';

const filterOptions = [
  {
    id: 'classic',
    label: 'Classic',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#BDEFD3]',
    color: '#BDEFD3',
    icon: classicIcon,
  },
  {
    id: 'blackWhite',
    label: 'Black and White',
    layoutClass: 'col-span-8',
    bgClass: 'bg-[#E8E8E8]',
    color: '#E8E8E8',
    icon: blackWhiteIcon,
  },
  {
    id: 'oldFilm',
    label: 'Old Film',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#FFE9A8]',
    color: '#FFE9A8',
    icon: oldFilmIcon,
  },
  {
    id: 'dream',
    label: 'Dream Glow',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#E9DDF7]',
    color: '#E9DDF7',
    icon: dreamGlowIcon,
  },
  {
    id: 'thermal',
    label: 'Thermal',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#FF7A38]',
    color: '#FF7A38',
    icon: thermalIcon,
  },
  {
    id: 'pixel',
    label: 'Pixel Booth',
    layoutClass: 'col-span-8',
    bgClass: 'bg-[#35A7F2]',
    color: '#35A7F2',
    icon: pixelBoothIcon,
  },
  {
    id: 'dither',
    label: 'Dither',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#D9C7F0]',
    color: '#D9C7F0',
    icon: ditherIcon,
  },
  {
    id: 'greenNight',
    label: 'Surveillance',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#77D99D]',
    color: '#77D99D',
    icon: surveillanceIcon,
  },
  {
    id: 'vintageBlue',
    label: 'Vintage Blue',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#A9C8FF]',
    color: '#A9C8FF',
    icon: vintageBlueIcon,
  },
  {
    id: 'sunsetFade',
    label: 'Bading',
    layoutClass: 'col-span-4',
    bgClass: 'bg-[#FFB38A]',
    color: '#FFB38A',
    icon: badingIcon,
  },
];

function PhotoboothFilter({
  selectedFilter,
  setSelectedFilter,
  isDisabled = false,
}) {
  const handleSelectFilter = (filterId) => {
    if (isDisabled || selectedFilter === filterId) return;
    setSelectedFilter?.(filterId);
  };

  return (
    <div className="w-full overflow-visible">
      <div className="grid max-h-[340px] auto-rows-[46px] grid-cols-12 gap-1.5 overflow-y-auto overflow-x-hidden px-0.5 py-1.5 overscroll-contain sm:max-h-[460px] sm:auto-rows-[68px] sm:gap-3 sm:overflow-x-visible sm:px-2 sm:py-3">
        {filterOptions.map((filter) => {
          const isSelected = selectedFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleSelectFilter(filter.id)}
              disabled={isDisabled}
              className={`
                group relative flex h-full w-full items-center justify-between overflow-hidden rounded-[12px] px-2 py-2 text-left
                transition-[transform,background-color,color,border-color,box-shadow] duration-150 ease-out
                active:translate-y-1 active:scale-[0.98] active:shadow-none
                sm:rounded-[16px] sm:px-3.5 sm:py-3
                ${filter.layoutClass}
                ${
                  isSelected
                    ? 'border-2 border-[#05102D] bg-[#FDF9F2] text-[#1D56CF] shadow-[2px_3px_0_#05102D] md:animate-filter-slam sm:shadow-[3px_4px_0_#05102D]'
                    : `border border-[#05102D] ${filter.bgClass} text-[#05102D] md:hover:-translate-y-1 md:hover:border-2 md:hover:border-[#05102D] md:hover:shadow-[3px_4px_0_#05102D]`
                }
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
              aria-label={`Choose ${filter.label} filter`}
              aria-pressed={isSelected}
              title={filter.label}
            >
              <span
                className={`
                  pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-full md:block
                  ${
                    isSelected
                      ? 'animate-filter-button-slide bg-[#1D56CF]/10'
                      : 'opacity-0 group-active:animate-filter-button-slide group-active:bg-[#1D56CF]/10'
                  }
                `}
              />

              <span className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden rounded-[inherit] md:block">
                <span
                  className={`
                    absolute inset-y-0 left-[-60%] h-full w-[45%] bg-gradient-to-r from-transparent via-[#FDF9F2]/35 to-transparent
                    ${
                      isSelected
                        ? 'animate-filter-tool-shine'
                        : 'opacity-0 md:group-hover:animate-filter-tool-shine-once'
                    }
                  `}
                />
              </span>

              <span
                className={`
                  pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 transition-opacity duration-150
                  ${
                    isSelected
                      ? 'bg-gradient-to-t from-[#1D56CF]/10 to-transparent'
                      : 'bg-gradient-to-t from-[#FDF9F2]/25 to-transparent opacity-0 md:group-hover:opacity-100'
                  }
                `}
              />

              <div className="relative z-10 flex min-w-0 items-center gap-1.5 sm:gap-2.5">
                <div
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-150 ease-out sm:h-8 sm:w-8
                    ${
                      isSelected
                        ? 'rotate-[-6deg] scale-105 md:animate-icon-slam'
                        : 'rotate-[5deg] md:group-hover:rotate-[-5deg] md:group-hover:scale-110'
                    }
                  `}
                >
                  <img
                    src={filter.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 object-contain sm:h-6 sm:w-6"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <span
                  className={`
                    block truncate text-[10px] font-black leading-none tracking-[-0.04em] transition-transform duration-150 ease-out sm:text-[13px]
                    ${isSelected ? 'translate-x-0' : 'md:group-hover:translate-x-0.5'}
                  `}
                >
                  {filter.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes filterToolShine {
          0% {
            transform: translateX(0) skewX(-14deg);
            opacity: 0;
          }

          22% {
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

        @keyframes filterButtonSlide {
          0% {
            transform: translateX(-105%);
            opacity: 0;
          }

          24% {
            opacity: 1;
          }

          100% {
            transform: translateX(105%);
            opacity: 0;
          }
        }

        @keyframes filterSlam {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            box-shadow: none;
          }

          34% {
            transform: translateY(-3px) rotate(-0.5deg) scale(1.01);
            box-shadow: 3px 4px 0 #05102D;
          }

          64% {
            transform: translateY(1px) rotate(0.25deg) scale(0.995);
            box-shadow: 1px 1px 0 #05102D;
          }

          100% {
            transform: translateY(0) rotate(0deg) scale(1);
            box-shadow: 3px 4px 0 #05102D;
          }
        }

        @keyframes iconSlam {
          0% {
            transform: translateY(0) rotate(5deg) scale(1);
          }

          34% {
            transform: translateY(-4px) rotate(-9deg) scale(1.16);
          }

          64% {
            transform: translateY(1px) rotate(3deg) scale(0.96);
          }

          100% {
            transform: translateY(0) rotate(-6deg) scale(1.05);
          }
        }

        .animate-filter-tool-shine {
          animation: filterToolShine 1.35s ease-out 3;
        }

        .animate-filter-tool-shine-once {
          animation: filterToolShine 900ms ease-out 1;
        }

        .animate-filter-button-slide {
          animation: filterButtonSlide 620ms cubic-bezier(0.16, 1, 0.3, 1) 1;
        }

        .animate-filter-slam {
          animation: filterSlam 520ms cubic-bezier(0.16, 1, 0.3, 1.12) 1;
        }

        .animate-icon-slam {
          animation: iconSlam 520ms cubic-bezier(0.16, 1, 0.3, 1.12) 1;
        }

        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .animate-filter-tool-shine,
          .animate-filter-tool-shine-once,
          .animate-filter-button-slide,
          .animate-filter-slam,
          .animate-icon-slam {
            animation: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-filter-tool-shine,
          .animate-filter-tool-shine-once,
          .animate-filter-button-slide,
          .animate-filter-slam,
          .animate-icon-slam {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export { filterOptions };

export default PhotoboothFilter;