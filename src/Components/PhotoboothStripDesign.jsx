import { useEffect, useMemo, useState } from 'react';

import stripBg1 from '../assets/1.png';
import stripBg2 from '../assets/2.png';
import stripBg3 from '../assets/3.png';
import stripBg4 from '../assets/4.png';
import stripBg5 from '../assets/5.png';
import stripBg6 from '../assets/6.png';
import stripBg7 from '../assets/7.png';
import stripBg8 from '../assets/8.png';
import stripBg9 from '../assets/9.png';
import stripBg10 from '../assets/10.png';

const stripColors = [
  { id: 'red', label: 'Red', value: '#EF4444' },
  { id: 'coral', label: 'Coral', value: '#FF6B6B' },
  { id: 'orange', label: 'Orange', value: '#FF8A3D' },
  { id: 'gold', label: 'Gold', value: '#F6C445' },
  { id: 'yellow', label: 'Yellow', value: '#FFE16A' },
  { id: 'lime', label: 'Lime', value: '#A3E635' },
  { id: 'green', label: 'Green', value: '#22C55E' },
  { id: 'mint', label: 'Mint', value: '#5EEAD4' },
  { id: 'cyan', label: 'Cyan', value: '#38BDF8' },
  { id: 'blue', label: 'Blue', value: '#1D56CF' },
  { id: 'indigo', label: 'Indigo', value: '#6366F1' },
  { id: 'lavender', label: 'Lavender', value: '#CBB7FF' },
  { id: 'purple', label: 'Purple', value: '#A855F7' },
  { id: 'pink', label: 'Pink', value: '#F9B8D0' },
  { id: 'hotPink', label: 'Hot Pink', value: '#FF4FA3' },
  { id: 'rose', label: 'Rose', value: '#FB7185' },
  { id: 'cream', label: 'Cream', value: '#FDF9F2' },
  { id: 'black', label: 'Black', value: '#111827' },
];

const stripImageDesigns = [
  { id: 'stripBg1', label: 'Design 1', value: stripBg1 },
  { id: 'stripBg2', label: 'Design 2', value: stripBg2 },
  { id: 'stripBg3', label: 'Design 3', value: stripBg3 },
  { id: 'stripBg4', label: 'Design 4', value: stripBg4 },
  { id: 'stripBg5', label: 'Design 5', value: stripBg5 },
  { id: 'stripBg6', label: 'Design 6', value: stripBg6 },
  { id: 'stripBg7', label: 'Design 7', value: stripBg7 },
  { id: 'stripBg8', label: 'Design 8', value: stripBg8 },
  { id: 'stripBg9', label: 'Design 9', value: stripBg9 },
  { id: 'stripBg10', label: 'Design 10', value: stripBg10 },
];

const CREAM = '#FDF9F2';
const NAVY = '#05102D';

const normalizeHex = (hexColor = CREAM) => {
  if (typeof hexColor !== 'string') return CREAM;

  const trimmed = hexColor.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();

  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;

  return CREAM;
};

const hueToHex = (hue = 0) => {
  const normalizedHue = Math.max(0, Math.min(360, Number(hue) || 0));
  const saturation = 82;
  const lightness = 58;

  const c = (1 - Math.abs((2 * lightness) / 100 - 1)) * (saturation / 100);
  const x = c * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  const m = lightness / 100 - c / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (normalizedHue < 60) {
    red = c;
    green = x;
  } else if (normalizedHue < 120) {
    red = x;
    green = c;
  } else if (normalizedHue < 180) {
    green = c;
    blue = x;
  } else if (normalizedHue < 240) {
    green = x;
    blue = c;
  } else if (normalizedHue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  const toHex = (value) => {
    const hex = Math.round((value + m) * 255).toString(16).padStart(2, '0');
    return hex.toUpperCase();
  };

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const hexToHue = (hexColor = CREAM) => {
  const fallbackHue = 44;
  const hex = normalizeHex(hexColor).replace('#', '');

  if (hex.length !== 6) return fallbackHue;

  const red = parseInt(hex.slice(0, 2), 16) / 255;
  const green = parseInt(hex.slice(2, 4), 16) / 255;
  const blue = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return fallbackHue;

  let hue = 0;

  if (max === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (max === green) {
    hue = 60 * ((blue - red) / delta + 2);
  } else {
    hue = 60 * ((red - green) / delta + 4);
  }

  return Math.round((hue + 360) % 360);
};

const getContrastColor = (hexColor = CREAM) => {
  const hex = normalizeHex(hexColor).replace('#', '');

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? NAVY : CREAM;
};

const getBackgroundImageStyle = (image = '') => {
  if (!image || typeof image !== 'string') return 'none';
  if (image.startsWith('url(')) return image;

  return `url("${image}")`;
};

function MiniStripPreview({
  selectedShotCount,
  selectedStripColor = CREAM,
  selectedStripImage = '',
}) {
  const photoCount = Math.min(Math.max(Number(selectedShotCount) || 1, 1), 4);
  const safeStripColor = normalizeHex(selectedStripColor);
  const textColor = selectedStripImage ? CREAM : getContrastColor(safeStripColor);

  return (
    <div
      className="relative h-32 w-20 overflow-hidden rounded-[10px] border border-[#05102D] sm:h-40 sm:w-24"
      style={{
        backgroundColor: safeStripColor,
        backgroundImage: getBackgroundImageStyle(selectedStripImage),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {selectedStripImage && (
        <div className="pointer-events-none absolute inset-0 bg-[#05102D]/10" />
      )}

      <div className="relative z-10 flex h-full w-full flex-col gap-1 px-2.5 py-2.5 sm:gap-1.5 sm:px-3 sm:py-3">
        <div
          className="mb-0.5 mt-1.5 text-center text-[8px] font-black leading-none drop-shadow sm:mb-1 sm:mt-2 sm:text-[9px]"
          style={{ color: textColor }}
        >
          Photo2y
        </div>

        {Array.from({ length: photoCount }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[4px] bg-[#FDF9F2]">
            <div className="h-4 rounded-[3px] bg-[#FDF9F2] sm:h-5" />
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#FDF9F2] sm:bottom-4 sm:h-1.5 sm:w-10" />
      </div>
    </div>
  );
}

function ArrowHeadIcon({ isOpen = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-5 w-5 text-[#05102D] transition-transform duration-200 ease-out ${
        isOpen ? 'rotate-180 translate-y-[-1px] scale-110' : 'rotate-0 translate-y-0 scale-100'
      }`}
      fill="none"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StripBackgroundButton({
  design,
  selectedShotCount,
  selectedStripImage,
  onSelect,
  handleHoverMove,
  setHoverPreview,
}) {
  const isSelected = selectedStripImage === design.value;

  return (
    <button
      type="button"
      title={design.label}
      aria-label={`Select ${design.label} strip background`}
      onMouseMove={(event) =>
        handleHoverMove?.(event, {
          label: design.label,
          count: selectedShotCount,
          selectedStripColor: CREAM,
          selectedStripImage: design.value,
        })
      }
      onMouseLeave={() => setHoverPreview?.(null)}
      onClick={() => onSelect?.(design)}
      className={`
        group/image relative flex h-11 w-full min-w-0 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-2 border-[#05102D]
        transition-[transform,border-color,box-shadow] duration-150 ease-out active:translate-y-1 active:scale-95 active:shadow-none
        sm:h-16 sm:w-16 sm:rounded-[20px]
        ${
          isSelected
            ? 'z-10 -translate-y-0.5 rotate-[-1deg] shadow-[2px_3px_0_#05102D] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] md:animate-strip-bg-selected-pop sm:-translate-y-1 sm:rotate-[-2deg] sm:shadow-[4px_5px_0_#05102D] sm:ring-offset-2'
            : 'md:hover:-translate-y-1 md:hover:rotate-[2deg] md:hover:scale-110 md:hover:border-[#1D56CF] md:hover:shadow-[3px_4px_0_#05102D]'
        }
      `}
      style={{
        backgroundColor: CREAM,
        backgroundImage: getBackgroundImageStyle(design.value),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[inherit] md:block">
        <span
          className={`
            absolute inset-y-0 left-[-55%] h-full w-[42%] rotate-12 bg-[#FDF9F2]/55 blur-[1px]
            ${
              isSelected
                ? 'animate-strip-bg-selected-shine'
                : 'opacity-0 md:group-hover/image:animate-strip-tool-shine-once'
            }
          `}
        />
      </span>
    </button>
  );
}

function PhotoboothStripDesign({
  selectedShotCount,
  selectedStripColor = CREAM,
  selectedStripImage = '',
  setSelectedStripColor,
  setSelectedStripImage,
  isDisabled,
  handleHoverMove,
  setHoverPreview,
}) {
  const safeSelectedStripColor = normalizeHex(selectedStripColor);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buttonSlideKey, setButtonSlideKey] = useState(0);
  const [selectedHue, setSelectedHue] = useState(() => hexToHue(safeSelectedStripColor));

  useEffect(() => {
    setSelectedHue(hexToHue(safeSelectedStripColor));
  }, [safeSelectedStripColor]);

  useEffect(() => {
    if (isDisabled) {
      setIsDropdownOpen(false);
      setHoverPreview?.(null);
    }
  }, [isDisabled, setHoverPreview]);

  const hueSliderProgress = `${(Math.max(0, Math.min(360, selectedHue)) / 360) * 100}%`;

  const selectedImageDesign = useMemo(
    () => stripImageDesigns.find((design) => design.value === selectedStripImage),
    [selectedStripImage]
  );

  const selectedPresetColor = useMemo(
    () =>
      stripColors.find(
        (color) => color.value.toUpperCase() === safeSelectedStripColor.toUpperCase()
      ),
    [safeSelectedStripColor]
  );

  const selectedColorLabel = selectedImageDesign
    ? selectedImageDesign.label
    : selectedPresetColor?.label || 'Custom Color';

  const triggerButtonSlide = () => {
    setButtonSlideKey((currentValue) => currentValue + 1);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setHoverPreview?.(null);
  };

  const handleHueChange = (event) => {
    if (isDisabled) return;

    const nextHue = Number(event.target.value);
    const nextColor = hueToHex(nextHue);

    setSelectedHue(nextHue);
    setSelectedStripColor?.(nextColor);
    setSelectedStripImage?.('');
    setHoverPreview?.(null);
  };

  const handleHueCommit = () => {
    if (isDisabled) return;

    triggerButtonSlide();
    closeDropdown();
  };

  const handlePresetColorSelect = (color) => {
    if (isDisabled) return;

    setSelectedHue(hexToHue(color.value));
    setSelectedStripColor?.(color.value);
    setSelectedStripImage?.('');
    setHoverPreview?.(null);
    triggerButtonSlide();
    closeDropdown();
  };

  const handleImageDesignSelect = (design) => {
    if (isDisabled) return;

    setSelectedStripImage?.(design.value);
    setHoverPreview?.(null);
    triggerButtonSlide();
  };

  const handleDropdownToggle = () => {
    if (isDisabled) return;

    setSelectedHue(hexToHue(safeSelectedStripColor));
    triggerButtonSlide();
    setIsDropdownOpen((currentValue) => !currentValue);
  };

  return (
    <div className="w-full overflow-visible">
      <div className="mb-2 flex items-center justify-center md:hidden">
        <MiniStripPreview
          selectedShotCount={selectedShotCount}
          selectedStripColor={selectedImageDesign ? CREAM : safeSelectedStripColor}
          selectedStripImage={selectedStripImage}
        />
      </div>

      <div className="relative w-full">
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleDropdownToggle}
          className={`
            group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-[18px] border border-[#05102D] bg-[#FDF9F2] px-3 text-left
            transition-[transform,border-color] duration-150 ease-out active:translate-y-1
            sm:h-20 sm:rounded-[22px] sm:px-4
            md:hover:-translate-y-0.5 md:hover:border-[#1D56CF]
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          aria-expanded={isDropdownOpen}
          aria-label="Choose strip design color"
        >
          <span
            key={buttonSlideKey}
            className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-full bg-[#1D56CF]/10 md:block md:animate-strip-button-slide"
          />

          <span className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden rounded-[inherit] opacity-0 md:block md:group-hover:opacity-100">
            <span className="absolute inset-y-0 left-[-60%] h-full w-[45%] animate-strip-tool-shine-once bg-gradient-to-r from-transparent via-[#FDF9F2]/45 to-transparent" />
          </span>

          <span className="relative z-10 flex min-w-0 items-center gap-2.5 sm:gap-4">
            <span
              className="h-8 w-8 shrink-0 rounded-full border border-[#05102D] sm:h-11 sm:w-11"
              style={{
                backgroundColor: selectedImageDesign ? CREAM : safeSelectedStripColor,
                backgroundImage: selectedImageDesign
                  ? getBackgroundImageStyle(selectedImageDesign.value)
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <span className="min-w-0">
              <span className="block truncate text-[13px] font-black leading-none tracking-[-0.03em] text-[#05102D] sm:text-[15px]">
                {selectedColorLabel}
              </span>
            </span>
          </span>

          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center text-[#05102D] sm:h-9 sm:w-9">
            <ArrowHeadIcon isOpen={isDropdownOpen} />
          </span>
        </button>

        <div
          className={`
            absolute left-0 right-0 top-[calc(100%+6px)] z-50 origin-top overflow-hidden rounded-[18px] border border-[#05102D] bg-[#FDF9F2]
            transition-[max-height,opacity,transform] duration-200 ease-out
            sm:top-[calc(100%+10px)] sm:rounded-[24px]
            ${
              !isDisabled && isDropdownOpen
                ? 'pointer-events-auto max-h-[360px] translate-y-0 opacity-100 sm:max-h-[460px]'
                : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
            }
          `}
        >
          <div
            className={`
              px-2.5 py-3 transition-transform duration-200 ease-out sm:px-4 sm:py-5
              ${isDropdownOpen ? 'translate-y-0' : '-translate-y-3'}
            `}
          >
            <div className="rounded-[16px] border border-[#05102D] bg-[#FDF9F2] p-3 sm:rounded-[20px] sm:p-4">
              <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
                <div
                  className="h-9 w-9 shrink-0 rounded-xl border border-[#05102D] shadow-[1px_2px_0_#05102D] sm:h-12 sm:w-12 sm:rounded-2xl"
                  style={{ backgroundColor: safeSelectedStripColor }}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#05102D]/55 sm:text-xs sm:tracking-[0.2em]">
                    Hue Color
                  </p>

                  <p className="mt-0.5 text-xs font-black text-[#1D56CF] sm:mt-1 sm:text-sm">
                    {safeSelectedStripColor}
                  </p>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                value={selectedHue}
                onChange={handleHueChange}
                onMouseUp={handleHueCommit}
                onTouchEnd={handleHueCommit}
                disabled={isDisabled}
                className="photo2y-hue-slider h-3 w-full cursor-pointer appearance-none rounded-full border border-[#05102D] bg-[linear-gradient(to_right,#EF4444,#FFE16A,#22C55E,#1D56CF,#CBB7FF,#FF4FA3,#EF4444)] sm:h-4"
                style={{ '--photo2y-hue-progress': hueSliderProgress }}
                aria-label="Choose strip hue color"
              />

              <div className="mt-3 grid grid-cols-6 gap-1.5 sm:mt-4 sm:gap-2.5">
                {stripColors.map((color) => {
                  const isSelected =
                    safeSelectedStripColor.toUpperCase() === color.value.toUpperCase() &&
                    !selectedImageDesign;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handlePresetColorSelect(color)}
                      disabled={isDisabled}
                      className={`
                        flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#05102D]
                        transition-[transform,box-shadow] duration-150 ease-out active:translate-y-0 active:shadow-none
                        sm:h-8 sm:w-8
                        md:hover:-translate-y-0.5 md:hover:shadow-[2px_3px_0_#05102D]
                        ${
                          isSelected
                            ? 'scale-105 shadow-[1px_2px_0_#05102D] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] sm:scale-110 sm:shadow-[2px_3px_0_#05102D] sm:ring-offset-2'
                            : ''
                        }
                        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      `}
                      style={{ backgroundColor: color.value }}
                      aria-label={`Choose ${color.label} strip color`}
                      title={color.label}
                    >
                      {isSelected && (
                        <span
                          className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${
                            getContrastColor(color.value) === CREAM
                              ? 'bg-[#FDF9F2]'
                              : 'bg-[#05102D]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`
          mt-3 rounded-[18px] border-2 border-[#05102D] bg-[#FDF9F2] p-2.5 shadow-[2px_3px_0_#05102D]
          sm:mt-4 sm:rounded-[26px] sm:p-4 sm:shadow-[4px_5px_0_#05102D]
          md:animate-strip-bg-panel-pop
          ${isDisabled ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#05102D]/55 sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
          Strip Backgrounds
        </p>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-3.5">
          {stripImageDesigns.map((design) => (
            <StripBackgroundButton
              key={design.id}
              design={design}
              selectedShotCount={selectedShotCount}
              selectedStripImage={selectedStripImage}
              onSelect={handleImageDesignSelect}
              handleHoverMove={handleHoverMove}
              setHoverPreview={setHoverPreview}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes stripToolShine {
          0% {
            transform: translateX(0) skewX(-14deg);
            opacity: 0;
          }

          25% {
            opacity: 1;
          }

          65% {
            opacity: 1;
          }

          100% {
            transform: translateX(355%) skewX(-14deg);
            opacity: 0;
          }
        }

        @keyframes stripButtonSlide {
          0% {
            transform: translateX(-105%);
            opacity: 0;
          }

          25% {
            opacity: 1;
          }

          100% {
            transform: translateX(105%);
            opacity: 0;
          }
        }

        @keyframes stripBgPanelPop {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.97) rotate(-0.5deg);
          }

          70% {
            opacity: 1;
            transform: translateY(-2px) scale(1.01) rotate(0.4deg);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes stripBgSelectedPop {
          0%, 100% {
            transform: translateY(-4px) rotate(-2deg) scale(1);
          }

          50% {
            transform: translateY(-6px) rotate(2deg) scale(1.04);
          }
        }

        @keyframes stripBgSelectedShine {
          0% {
            transform: translateX(0) rotate(12deg) skewX(-14deg);
            opacity: 0;
          }

          25% {
            opacity: 1;
          }

          65% {
            opacity: 1;
          }

          100% {
            transform: translateX(360%) rotate(12deg) skewX(-14deg);
            opacity: 0;
          }
        }

        .animate-strip-tool-shine {
          animation: stripToolShine 1.35s ease-out 3;
        }

        .animate-strip-tool-shine-once {
          animation: stripToolShine 900ms ease-out 1;
        }

        .animate-strip-button-slide {
          animation: stripButtonSlide 560ms ease-out 1;
        }

        .animate-strip-bg-panel-pop {
          animation: stripBgPanelPop 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-strip-bg-selected-pop {
          animation: stripBgSelectedPop 1.1s ease-in-out 3;
        }

        .animate-strip-bg-selected-shine {
          animation: stripBgSelectedShine 1.35s ease-in-out 3;
        }

        .photo2y-hue-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          border: 3px solid #05102D;
          background: #FDF9F2;
          box-shadow: 2px 3px 0 #05102D;
          cursor: pointer;
          margin-top: -4px;
        }

        .photo2y-hue-slider::-webkit-slider-runnable-track {
          height: 12px;
          border-radius: 9999px;
        }

        .photo2y-hue-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          border: 3px solid #05102D;
          background: #FDF9F2;
          box-shadow: 2px 3px 0 #05102D;
          cursor: pointer;
        }

        .photo2y-hue-slider::-moz-range-track {
          height: 12px;
          border-radius: 9999px;
        }

        @media (min-width: 640px) {
          .photo2y-hue-slider::-webkit-slider-thumb {
            height: 24px;
            width: 24px;
            margin-top: -5px;
          }

          .photo2y-hue-slider::-webkit-slider-runnable-track {
            height: 16px;
          }

          .photo2y-hue-slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
          }

          .photo2y-hue-slider::-moz-range-track {
            height: 16px;
          }
        }

        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .animate-strip-tool-shine,
          .animate-strip-tool-shine-once,
          .animate-strip-button-slide,
          .animate-strip-bg-panel-pop,
          .animate-strip-bg-selected-pop,
          .animate-strip-bg-selected-shine {
            animation: none !important;
          }

          .photo2y-hue-slider::-webkit-slider-thumb {
            box-shadow: 1px 2px 0 #05102D;
          }

          .photo2y-hue-slider::-moz-range-thumb {
            box-shadow: 1px 2px 0 #05102D;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-strip-tool-shine,
          .animate-strip-tool-shine-once,
          .animate-strip-button-slide,
          .animate-strip-bg-panel-pop,
          .animate-strip-bg-selected-pop,
          .animate-strip-bg-selected-shine {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export {
  stripColors,
  stripImageDesigns,
  MiniStripPreview,
  getContrastColor,
  getBackgroundImageStyle,
};

export default PhotoboothStripDesign;