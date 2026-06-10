import { useEffect, useState } from 'react';

import photosIcon from '../assets/Polaroid.png';
import cameraIcon from '../assets/Camera.png';
import scissorsIcon from '../assets/Scissor.png';
import Photo2yInfo from './Photo2yInfo.jsx';

const darkModeIcon =
  'https://api.iconify.design/material-symbols:dark-mode-rounded.svg?color=%2305102D';
const lightModeIcon =
  'https://api.iconify.design/material-symbols:light-mode-rounded.svg?color=%23FDF9F2';

function Header({
  photoCount = 0,
  currentPage,
  onHomeClick,
  onPhotosClick,
  onTakePhotoClick,
  isCameraReady,
  isCameraOn,
  isCountingDown,
}) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('photo2y-dark-mode') === 'on';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('photo2y-dark', isDarkMode);

    try {
      localStorage.setItem('photo2y-dark-mode', isDarkMode ? 'on' : 'off');
    } catch {
      // Ignore storage errors.
    }
  }, [isDarkMode]);

  const isBusy = Boolean(isCountingDown);
  const isPhotosPage = currentPage === 'photos';
  const canTakePhoto = isPhotosPage || (isCameraReady && isCameraOn && !isBusy);
  const themeIcon = isDarkMode ? lightModeIcon : darkModeIcon;

  const handleLogoClick = () => {
    onHomeClick?.();
    setIsMobileMenuOpen(false);
    setIsInfoOpen(true);
  };

  const handlePhotosClick = () => {
    setIsMobileMenuOpen(false);
    onPhotosClick?.();
  };

  const handleTakePhotoClick = () => {
    setIsMobileMenuOpen(false);
    onTakePhotoClick?.();
  };

  const handleThemeToggle = () => {
    setIsDarkMode((currentValue) => !currentValue);
  };

  return (
    <>
      <header
        className={`relative z-[90] w-full px-3 py-3 transition-colors duration-300 sm:px-4 sm:py-4 md:px-8 ${
          isMobileMenuOpen
            ? isDarkMode
              ? 'bg-[#151515] text-[#FDF9F2] md:bg-[#FDF9F2] md:text-[#05102D]'
              : 'bg-[#D1D5DB] text-[#05102D] md:bg-[#FDF9F2]'
            : 'bg-[#FDF9F2] text-[#05102D]'
        }`}
      >
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-0">
          <span className="absolute -bottom-[15px] left-4 z-10 flex h-8 w-10 items-center justify-center md:left-8">
            <img
              src={scissorsIcon}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className={`h-8 w-8 rotate-[8deg] object-contain transition-transform duration-300 ${
                isDarkMode
                  ? 'md:brightness-125 md:drop-shadow-[0_0_5px_rgba(253,249,242,0.45)]'
                  : ''
              }`}
            />
          </span>

          <span
            className="absolute bottom-0 left-[3.6rem] right-0 h-[2px] md:left-[5.1rem]"
            style={{
              backgroundImage: isDarkMode
                ? 'repeating-linear-gradient(to right, rgba(253,249,242,0.85) 0 8px, transparent 8px 16px)'
                : isMobileMenuOpen
                  ? 'repeating-linear-gradient(to right, rgba(5,16,45,0.5) 0 8px, transparent 8px 16px)'
                  : 'repeating-linear-gradient(to right, rgba(5,16,45,0.35) 0 8px, transparent 8px 16px)',
            }}
          />
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 md:gap-4">
          <button
            type="button"
            onClick={handleLogoClick}
            className="rounded-2xl px-2 py-1 font-serif text-4xl font-black leading-none tracking-[-0.04em] text-[#1D56CF] transition-transform duration-200 ease-out animate-[photo2y-mobile-bounce_1.25s_ease-in-out_2] hover:scale-105 hover:rotate-[-1deg] active:scale-95 sm:text-4xl md:animate-none md:text-5xl"
            aria-label="Open Photo2y info"
          >
            Photo2y
          </button>

          <nav className="hidden items-center gap-3 md:flex md:gap-5">
            <button
              type="button"
              onClick={handleThemeToggle}
              className={`group relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-[#05102D] px-4 py-3 font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:translate-y-1 active:shadow-none ${
                isDarkMode
                  ? 'bg-[#1D56CF] text-[#FDF9F2] hover:-translate-y-1 hover:rotate-[1deg] hover:bg-[#1746A8] hover:shadow-[3px_4px_0_#05102D]'
                  : 'bg-[#FDF9F2] text-[#05102D] hover:-translate-y-1 hover:rotate-[1deg] hover:bg-[#1D56CF] hover:text-[#FDF9F2] hover:shadow-[3px_4px_0_#05102D]'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode && (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span className="absolute inset-y-0 left-[-60%] h-full w-[45%] animate-header-shine bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </span>
              )}

              <img
                src={themeIcon}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                className="relative h-5 w-5 object-contain transition-transform duration-200 group-hover:scale-125"
              />
            </button>

            <button
              type="button"
              onClick={handlePhotosClick}
              className={`group relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-[#05102D] px-4 py-3 font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:translate-y-1 active:shadow-none ${
                isPhotosPage
                  ? 'bg-[#1D56CF] text-[#FDF9F2] hover:-translate-y-1 hover:rotate-[-1deg] hover:shadow-[3px_4px_0_#05102D]'
                  : 'bg-[#FDF9F2] text-[#05102D] hover:-translate-y-1 hover:rotate-[-1deg] hover:bg-[#1D56CF] hover:text-[#FDF9F2] hover:shadow-[3px_4px_0_#05102D]'
              }`}
            >
              {isPhotosPage && (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span className="absolute inset-y-0 left-[-60%] h-full w-[45%] animate-header-shine bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </span>
              )}

              <img
                src={photosIcon}
                alt="Photos"
                loading="eager"
                decoding="async"
                className="relative h-5 w-5 object-contain transition-transform duration-200 ease-out group-hover:scale-125"
              />

              <span className="hidden sm:inline">Photos</span>

              {photoCount > 0 && (
                <span
                  className={`relative rounded-lg px-2 py-1 text-xs transition-transform duration-200 ease-out group-hover:scale-110 ${
                    isPhotosPage
                      ? 'bg-[#FDF9F2] text-[#1D56CF]'
                      : 'bg-[#1D56CF] text-[#FDF9F2] group-hover:bg-[#FDF9F2] group-hover:text-[#1D56CF]'
                  }`}
                >
                  {photoCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleTakePhotoClick}
              disabled={!canTakePhoto}
              className={`group relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-[#05102D] px-4 py-3 font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:translate-y-1 active:shadow-none md:px-6 ${
                canTakePhoto
                  ? 'bg-[#1D56CF] text-[#FDF9F2] hover:-translate-y-1 hover:rotate-[1deg] hover:bg-[#1746A8] hover:shadow-[3px_4px_0_#05102D]'
                  : 'cursor-not-allowed bg-[#05102D]/15 text-[#05102D]/45'
              }`}
            >
              {canTakePhoto && (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span className="absolute inset-y-0 left-[-60%] h-full w-[45%] animate-header-shine bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </span>
              )}

              <img
                src={cameraIcon}
                alt="Take a photo"
                loading="eager"
                decoding="async"
                className={`relative h-5 w-5 object-contain transition-transform duration-200 ease-out ${
                  canTakePhoto ? 'group-hover:scale-125' : 'opacity-45'
                }`}
              />

              <span>Take a photo!</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
            className={`group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#05102D] transition-[transform,background-color,color] duration-200 ease-out active:translate-y-1 active:shadow-none md:hidden ${
              isMobileMenuOpen
                ? 'bg-[#1D56CF] text-[#FDF9F2]'
                : 'bg-[#FDF9F2] text-[#05102D] active:bg-[#1D56CF] active:text-[#FDF9F2]'
            }`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="absolute inset-0 bg-[#FDF9F2]/20 opacity-0 transition-opacity duration-150 group-active:opacity-100" />

            <span
              className={`relative flex h-7 w-7 items-center justify-center transition-transform duration-200 ease-out ${
                isMobileMenuOpen ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-7 w-7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>

        <div
          className={`mx-auto mt-3 w-full max-w-7xl overflow-hidden transition-[max-height,opacity] duration-200 ease-out md:hidden ${
            isMobileMenuOpen ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="rounded-[28px] border-2 border-[#05102D] bg-[#FDF9F2] p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleThemeToggle}
                className={`group relative flex min-h-[54px] items-center justify-center overflow-hidden rounded-2xl border-2 border-[#05102D] px-3 py-3 font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:translate-y-1 active:shadow-none ${
                  isDarkMode
                    ? 'bg-[#1D56CF] text-[#FDF9F2] shadow-[2px_3px_0_#05102D]'
                    : 'bg-[#FDF9F2] text-[#05102D] active:bg-[#1D56CF] active:text-[#FDF9F2]'
                }`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                <img
                  src={themeIcon}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                  className="relative h-7 w-7 object-contain transition-transform duration-150 group-active:scale-110"
                />
              </button>

              <button
                type="button"
                onClick={handlePhotosClick}
                className={`group relative flex min-h-[54px] items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-[#05102D] px-3 py-3 font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:translate-y-1 active:shadow-none ${
                  isPhotosPage
                    ? 'bg-[#1D56CF] text-[#FDF9F2] shadow-[2px_3px_0_#05102D]'
                    : 'bg-[#FDF9F2] text-[#05102D] active:bg-[#1D56CF] active:text-[#FDF9F2]'
                }`}
              >
                <img
                  src={photosIcon}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                  className="relative h-5 w-5 object-contain transition-transform duration-150 ease-out group-active:scale-110"
                />

                <span>Photos</span>

                {photoCount > 0 && (
                  <span
                    className={`rounded-lg px-2 py-1 text-xs ${
                      isPhotosPage ? 'bg-[#FDF9F2] text-[#1D56CF]' : 'bg-[#1D56CF] text-[#FDF9F2]'
                    }`}
                  >
                    {photoCount}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleTakePhotoClick}
              disabled={!canTakePhoto}
              className={`group relative mt-2 flex min-h-[58px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-[#05102D] px-4 py-3 font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:translate-y-1 active:shadow-none ${
                canTakePhoto
                  ? 'bg-[#1D56CF] text-[#FDF9F2] shadow-[2px_3px_0_#05102D] active:bg-[#1746A8]'
                  : 'cursor-not-allowed bg-[#05102D]/15 text-[#05102D]/45'
              }`}
            >
              <img
                src={cameraIcon}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                className={`relative h-6 w-6 object-contain transition-transform duration-150 ease-out ${
                  canTakePhoto ? 'group-active:scale-110' : 'opacity-45'
                }`}
              />

              <span>Take a photo!</span>
            </button>
          </nav>
        </div>
      </header>

      <style>{`
        @keyframes photo2y-mobile-bounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          20% {
            transform: translateY(-5px) rotate(-1deg) scale(1.035);
          }
          40% {
            transform: translateY(0) rotate(1deg) scale(1);
          }
          60% {
            transform: translateY(-3px) rotate(-0.6deg) scale(1.025);
          }
          80% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }

        @keyframes header-shine {
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

        .animate-header-shine {
          animation: header-shine 1.55s ease-in-out 3;
          will-change: transform, opacity;
        }

        @media (max-width: 767px) {
          .animate-header-shine,
          .animate-header-arrow-shine {
            animation: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-header-shine,
          .animate-header-arrow-shine,
          .animate-\$begin:math:display$photo2y\-mobile\-bounce\_1\\\\\.25s\_ease\-in\-out\_2\\$end:math:display$ {
            animation: none !important;
          }
        }
      `}</style>

      <Photo2yInfo isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </>
  );
}

export default Header;