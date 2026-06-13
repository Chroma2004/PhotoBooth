import { useMemo, useState } from 'react';

import downloadedSticker1 from '../assets/Sticker1.png';
import downloadedSticker2 from '../assets/Sticker2.png';
import downloadedSticker3 from '../assets/Sticker3.png';
import downloadedSticker4 from '../assets/Sticker4.png';
import downloadedSticker5 from '../assets/Sticker5.png';
import downloadedSticker6 from '../assets/Sticker6.png';
import downloadedSticker7 from '../assets/Sticker7.png';
import downloadedSticker8 from '../assets/Sticker8.png';
import downloadedSticker9 from '../assets/Sticker9.png';

import cameraIcon from '../assets/Camera.png';
import editIcon from '../assets/Edit.png';
import filterIcon from '../assets/Filter.png';
import fishEyeIcon from '../assets/FishEye.png';
import pictureShineIcon from '../assets/PictureShine.png';
import polaroidIcon from '../assets/Polaroid.png';
import scissorsIcon from '../assets/Scissor.png';
import stripDesignIcon from '../assets/StripDesign.png';
import trashIcon from '../assets/Trash.png';

function ArrowHeadIcon({ isOpen = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-7 w-7 transition-transform duration-200 ease-out ${
        isOpen ? 'rotate-180' : 'rotate-0'
      }`}
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
  );
}

const downloadedStickerOptions = [
  {
    id: 'downloaded-sticker-1',
    label: 'Sticker 1',
    src: downloadedSticker1,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-2',
    label: 'Sticker 2',
    src: downloadedSticker2,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-3',
    label: 'Sticker 3',
    src: downloadedSticker3,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-4',
    label: 'Sticker 4',
    src: downloadedSticker4,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-5',
    label: 'Sticker 5',
    src: downloadedSticker5,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-6',
    label: 'Sticker 6',
    src: downloadedSticker6,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-7',
    label: 'Sticker 7',
    src: downloadedSticker7,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-8',
    label: 'Sticker 8',
    src: downloadedSticker8,
    hasWhiteBorder: true,
  },
  {
    id: 'downloaded-sticker-9',
    label: 'Sticker 9',
    src: downloadedSticker9,
    hasWhiteBorder: true,
  },
];

const appIconStickerOptions = [
  { id: 'app-icon-camera', label: 'Camera Icon', src: cameraIcon },
  { id: 'app-icon-edit', label: 'Edit Icon', src: editIcon },
  { id: 'app-icon-filter', label: 'Filter Icon', src: filterIcon },
  { id: 'app-icon-fish-eye', label: 'Fish Eye Icon', src: fishEyeIcon },
  { id: 'app-icon-picture-shine', label: 'Picture Shine Icon', src: pictureShineIcon },
  { id: 'app-icon-polaroid', label: 'Polaroid Icon', src: polaroidIcon },
  { id: 'app-icon-scissors', label: 'Scissors Icon', src: scissorsIcon },
  { id: 'app-icon-strip-design', label: 'Strip Design Icon', src: stripDesignIcon },
  { id: 'app-icon-trash', label: 'Trash Icon', src: trashIcon },
];

function StickerButton({ sticker, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(sticker)}
      aria-label={`Add ${sticker.label} sticker`}
      className="group relative flex h-8 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#05102D] bg-[#FDF9F2] p-1 shadow-[2px_3px_0_#05102D] transition-[transform,background-color,box-shadow] duration-150 ease-out sm:h-9 sm:p-1.5 md:h-12 md:w-12 md:rounded-2xl md:p-2 md:motion-safe:animate-customize-mobile-button-pop md:hover:-translate-y-1 md:hover:rotate-[3deg] md:hover:bg-white md:hover:shadow-[4px_5px_0_#05102D] active:translate-y-1 active:rotate-[-2deg] active:scale-95 active:shadow-none"
    >
      <span className="pointer-events-none absolute inset-0 hidden bg-[#1D56CF]/10 opacity-0 md:block md:group-hover:animate-customize-soft-shine-once" />

      <img
        src={sticker.src}
        alt=""
        aria-hidden="true"
        className={`relative z-10 h-full w-full object-contain transition-transform duration-150 active:scale-110 md:group-hover:scale-110 ${
          sticker.hasWhiteBorder
            ? '[filter:drop-shadow(0_1px_0_#FFFFFF)_drop-shadow(1px_0_0_#FFFFFF)_drop-shadow(0_-1px_0_#FFFFFF)_drop-shadow(-1px_0_0_#FFFFFF)_drop-shadow(0_2px_1px_rgba(5,16,45,0.22))]'
            : ''
        }`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </button>
  );
}

function StripDesignButton({
  design,
  isSelected,
  onClick,
  getBackgroundImageStyle,
  cream,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Use ${design.label}`}
      className={`
        relative h-10 w-full min-w-0 overflow-hidden rounded-xl border-2 border-[#05102D]
        transition-[transform,box-shadow] duration-150 ease-out sm:h-11 md:h-12 md:w-12 md:rounded-2xl md:motion-safe:animate-customize-mobile-button-pop md:hover:-translate-y-1 md:hover:rotate-[2deg] md:hover:scale-105 md:hover:shadow-[2px_3px_0_#05102D]
        active:translate-y-1 active:rotate-[2deg] active:scale-95 active:shadow-none
        ${
          isSelected
            ? 'scale-105 shadow-[2px_3px_0_#05102D] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] md:animate-customize-choice-pop sm:ring-offset-2'
            : ''
        }
      `}
      style={{
        backgroundColor: cream,
        backgroundImage: getBackgroundImageStyle?.(design.value) || 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}

function FontOptionButton({ font, isSelected, onClick }) {
  const isMonoFont =
    font.id?.toLowerCase().includes('mono') ||
    font.label?.toLowerCase().includes('mono') ||
    font.family?.toLowerCase().includes('mono');

  const chunkyFontFamily = isMonoFont
    ? font.family
    : `${font.family}, Impact, "Arial Black", "Comic Sans MS", fantasy`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Use ${font.label} font`}
      className={`
        group relative min-w-0 overflow-hidden rounded-2xl border-2 border-[#05102D] px-2.5 py-2 text-center sm:rounded-[18px] sm:px-3 sm:py-2.5
        transition-[transform,background-color,color,box-shadow] duration-150 ease-out md:motion-safe:animate-customize-mobile-button-pop active:translate-y-1 active:rotate-[-1deg] active:scale-[0.97] active:shadow-none
        ${
          isSelected
            ? 'bg-[#1D56CF] text-[#FDF9F2] shadow-[2px_3px_0_#05102D] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] md:animate-customize-choice-pop sm:ring-offset-2'
            : 'bg-[#FDF9F2] text-[#05102D] md:hover:-translate-y-1 md:hover:rotate-[-0.7deg] md:hover:bg-white md:hover:shadow-[2px_3px_0_#05102D]'
        }
      `}
    >
      <span
        className={`pointer-events-none absolute inset-0 hidden bg-[#FDF9F2]/20 md:block ${
          isSelected
            ? 'animate-customize-soft-shine'
            : 'opacity-0 md:group-hover:animate-customize-soft-shine-once'
        }`}
      />

      <span
        className="relative z-10 block truncate text-sm font-black uppercase leading-none tracking-[-0.04em] sm:text-base xl:text-lg"
        style={{
          fontFamily: chunkyFontFamily,
          fontWeight: 1000,
          WebkitTextStroke: isMonoFont ? '0' : '0.45px currentColor',
          textShadow: isSelected
            ? '1px 1px 0 #05102D, 2px 2px 0 rgba(5,16,45,0.35)'
            : '1px 1px 0 rgba(29,86,207,0.22)',
        }}
      >
        {font.preview}
      </span>

      <span
        className={`relative z-10 mt-1 block text-[8px] font-black uppercase tracking-wide sm:text-[9px] ${
          isSelected ? 'text-[#FDF9F2]' : 'text-[#1D56CF]'
        }`}
      >
        {font.label}
      </span>
    </button>
  );
}

const fontColorOptions = [
  { id: 'black', label: 'Black', value: '#05102D' },
  { id: 'white', label: 'White', value: '#FDF9F2' },
  { id: 'blue', label: 'Blue', value: '#1D56CF' },
  { id: 'red', label: 'Red', value: '#E53935' },
  { id: 'dark-green', label: 'Dark Green', value: '#0B4F2A' },
];

const fontSizeOptions = [
  { id: 'xs', label: 'XS', value: 'xs' },
  { id: 'sm', label: 'S', value: 'sm' },
  { id: 'md', label: 'M', value: 'md' },
  { id: 'lg', label: 'L', value: 'lg' },
  { id: 'xl', label: 'XL', value: 'xl' },
];

function FontColorButton({ color, isSelected, onClick }) {
  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      aria-label={`Use ${color.label} font color`}
      className={`h-8 w-8 rounded-full border-2 border-[#05102D] transition-[transform,box-shadow] duration-150 ease-out active:translate-y-1 active:scale-95 sm:h-9 sm:w-9 md:hover:-translate-y-1 md:hover:scale-110 ${
        isSelected
          ? 'scale-110 border-[#1D56CF] shadow-[0_0_0_3px_#FDF9F2,0_0_0_6px_#1D56CF]'
          : ''
      }`}
      style={{ backgroundColor: color.value }}
    />
  );
}

function FontSizeButton({ size, isSelected, onClick }) {
  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      aria-label={`Use ${size.label} font size`}
      className={`rounded-full border-2 border-[#05102D] px-2 py-1.5 text-xs font-black uppercase tracking-wide transition-[transform,background-color,color] duration-150 active:translate-y-1 active:scale-95 sm:px-3 sm:py-2 sm:text-sm md:hover:-translate-y-1 ${
        isSelected
          ? 'scale-105 border-[#1D56CF] bg-[#1D56CF] text-[#FDF9F2] shadow-[0_0_0_3px_#FDF9F2,0_0_0_6px_#1D56CF]'
          : 'bg-[#FDF9F2] text-[#05102D] md:hover:bg-white'
      }`}
    >
      {size.label}
    </button>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="mb-3 border-b-2 border-dashed border-[#05102D]/25 bg-[#FDF9F2] px-0.5 pb-3.5 last:mb-0 last:border-b-0 last:pb-1 sm:mb-4 sm:px-1 sm:pb-4">
      <p className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#1D56CF] sm:mb-2.5 sm:text-[9px] sm:tracking-[0.16em]">
        {title}
      </p>

      {children}
    </div>
  );
}

function StripCustomization({
  selectedStripTheme,
  selectedPhotoStickers = [],
  editStripColors = [],
  editStripDesigns = [],
  editFontOptions = [],
  stickerOptions = [],
  onSelectStripColor,
  onSelectStripDesign,
  onSelectStripFont,
  onSelectStripFontColor,
  onSelectStripFontSize,
  onAddSticker,
  onClearStickers,
  onClose,
  getBackgroundImageStyle,
  cream = '#FDF9F2',
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragCurrentY, setDragCurrentY] = useState(null);
  const [selectedFontColorValue, setSelectedFontColorValue] = useState(
    selectedStripTheme?.stripFontColor || '#05102D'
  );
  const [selectedFontSizeValue, setSelectedFontSizeValue] = useState(
    selectedStripTheme?.stripFontSize || 'md'
  );

  const mergedStickerOptions = useMemo(() => {
    const seenStickerKeys = new Set();

    return [...stickerOptions, ...downloadedStickerOptions, ...appIconStickerOptions].filter(
      (sticker) => {
        const stickerKey = String(sticker.src || sticker.id || sticker.label).toLowerCase();

        if (seenStickerKeys.has(stickerKey)) return false;

        seenStickerKeys.add(stickerKey);
        return true;
      }
    );
  }, [stickerOptions]);

  if (!selectedStripTheme) return null;

  const activeFontColorValue = selectedStripTheme.stripFontColor || selectedFontColorValue;
  const activeFontSizeValue = selectedStripTheme.stripFontSize || selectedFontSizeValue;

  const handleSelectFontColor = (color) => {
    setSelectedFontColorValue(color.value);
    onSelectStripFontColor?.(color);
  };

  const handleSelectFontSize = (size) => {
    setSelectedFontSizeValue(size.value);
    onSelectStripFontSize?.(size);
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen((current) => !current);
  };

  const handleDrawerTouchStart = (event) => {
    const touch = event.touches?.[0];

    if (!touch) return;

    setDragStartY(touch.clientY);
    setDragCurrentY(touch.clientY);
  };

  const handleDrawerTouchMove = (event) => {
    const touch = event.touches?.[0];

    if (!touch || dragStartY === null) return;

    setDragCurrentY(touch.clientY);
  };

  const handleDrawerTouchEnd = () => {
    if (dragStartY === null || dragCurrentY === null) {
      setDragStartY(null);
      setDragCurrentY(null);
      return;
    }

    const dragDistance = dragCurrentY - dragStartY;
    const dragThreshold = 34;

    if (dragDistance > dragThreshold) {
      setIsDrawerOpen(false);
    }

    if (dragDistance < -dragThreshold) {
      setIsDrawerOpen(true);
    }

    setDragStartY(null);
    setDragCurrentY(null);
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <aside
      onTouchStart={handleDrawerTouchStart}
      onTouchMove={handleDrawerTouchMove}
      onTouchEnd={handleDrawerTouchEnd}
      onTouchCancel={handleDrawerTouchEnd}
      className={`
        fixed inset-x-2 bottom-2 z-[120] mx-auto flex min-h-0 w-auto max-w-xl flex-col overflow-hidden border-2 border-[#05102D] bg-[#FDF9F2]
        shadow-[0_-10px_34px_rgba(5,16,45,0.28),4px_5px_0_#05102D] transition-[height,max-height,border-radius,padding,transform,opacity] duration-200 ease-out md:motion-safe:animate-customize-drawer-up
        sm:inset-x-4 sm:bottom-4 lg:static lg:h-auto lg:max-h-[88vh] lg:w-full lg:max-w-none lg:rounded-[32px] lg:p-4 lg:shadow-[6px_8px_0_#05102D] lg:motion-safe:animate-customize-panel-pop
        ${
          isDrawerOpen
            ? 'h-[68dvh] max-h-[68dvh] rounded-[30px] p-2.5 sm:h-[72dvh] sm:max-h-[72dvh] sm:rounded-[34px] sm:p-3'
            : 'h-[74px] max-h-[74px] rounded-[24px] p-2 sm:h-[78px] sm:max-h-[78px] sm:rounded-[28px] sm:p-2.5'
        }
      `}
    >
      <div
        className="mb-2 flex shrink-0 touch-none items-center justify-center rounded-full py-1 lg:hidden"
        aria-hidden="true"
      >
        <span className="h-1.5 w-14 rounded-full bg-[#05102D]/25 transition-[width,background-color] duration-150" />
      </div>

      <div
        className={`
          sticky top-0 z-20 -mx-2.5 flex shrink-0 items-center justify-between gap-2 bg-[#FDF9F2] px-2.5 pt-1 transition-[margin,padding,border-color] duration-150
          sm:mx-0 sm:px-0 sm:pt-0 lg:relative lg:mb-3 lg:border-b-2 lg:border-dashed lg:border-[#05102D]/20 lg:pb-3
          ${
            isDrawerOpen
              ? 'mb-2.5 border-b-2 border-dashed border-[#05102D]/20 pb-2.5 sm:mb-3 sm:pb-3'
              : 'mb-0 border-b-0 pb-0 sm:mb-0 sm:pb-0'
          }
        `}
      >
        <button
          type="button"
          onClick={handleToggleDrawer}
          className="min-w-0 flex-1 text-center lg:pointer-events-none"
          aria-label={isDrawerOpen ? 'Hide customization drawer' : 'Open customization drawer'}
        >
          <h3 className="font-serif text-2xl font-black leading-none tracking-[-0.04em] text-[#1D56CF] sm:text-3xl">
            Customize
          </h3>
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#05102D] bg-[#1D56CF] text-lg font-black leading-none text-[#FDF9F2] shadow-[2px_3px_0_#05102D] transition-[transform,background-color,box-shadow] duration-150 sm:h-10 sm:w-10 sm:text-xl md:motion-safe:animate-customize-close-wiggle md:hover:-translate-y-1 md:hover:rotate-[6deg] md:hover:bg-[#1746A8] md:hover:shadow-[3px_4px_0_#05102D] active:translate-y-1 active:rotate-[8deg] active:scale-90 active:shadow-none"
          aria-label="Close customization panel"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div
        className={`
          min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain rounded-b-[22px] pr-1 transition-[opacity,max-height,padding] duration-200 [-webkit-overflow-scrolling:touch]
          sm:pr-0 lg:max-h-none lg:overflow-y-auto lg:rounded-b-none lg:opacity-100
          ${
            isDrawerOpen
              ? 'pb-8 opacity-100 sm:pb-4'
              : 'pointer-events-none max-h-0 pb-0 opacity-0 lg:pointer-events-auto'
          }
        `}
      >
        <SectionCard title="Strip colors">
          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-7 sm:gap-2">
            {editStripColors.map((color) => {
              const isSelected =
                selectedStripTheme.stripColor?.toUpperCase() === color.value.toUpperCase() &&
                !selectedStripTheme.stripImage;

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onSelectStripColor?.(color)}
                  aria-label={`Use ${color.label} strip color`}
                  className={`
                    h-8 w-8 rounded-full border-2 border-[#05102D] transition-[transform,box-shadow] duration-150 ease-out sm:h-9 sm:w-9
                    md:motion-safe:animate-customize-mobile-button-pop md:hover:-translate-y-1 md:hover:scale-110 md:hover:shadow-[2px_3px_0_#05102D] active:translate-y-0 active:scale-95 active:shadow-none
                    ${
                      isSelected
                        ? 'scale-110 shadow-[2px_3px_0_#05102D] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] md:animate-customize-choice-pop sm:ring-offset-2'
                        : ''
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                />
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Strip backgrounds">
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-5 sm:gap-2">
            {editStripDesigns.map((design) => (
              <StripDesignButton
                key={design.id}
                design={design}
                isSelected={selectedStripTheme.stripImage === design.value}
                onClick={() => onSelectStripDesign?.(design)}
                getBackgroundImageStyle={getBackgroundImageStyle}
                cream={cream}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Choose bold font style">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-1 sm:gap-2 xl:grid-cols-2">
            {editFontOptions.map((font) => (
              <FontOptionButton
                key={font.id}
                font={font}
                isSelected={selectedStripTheme.stripFont === font.family}
                onClick={() => onSelectStripFont?.(font)}
              />
            ))}
          </div>

          <div className="mt-3 sm:mt-3.5">
            <p className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#1D56CF] sm:text-[9px] sm:tracking-[0.16em]">
              Font color
            </p>

            <div className="grid grid-cols-5 gap-2 px-1 sm:gap-2.5">
              {fontColorOptions.map((color) => (
                <FontColorButton
                  key={color.id}
                  color={color}
                  isSelected={activeFontColorValue.toUpperCase() === color.value.toUpperCase()}
                  onClick={() => handleSelectFontColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 sm:mt-3.5">
            <p className="mb-2 px-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#1D56CF] sm:text-[9px] sm:tracking-[0.16em]">
              Font size
            </p>

            <div className="grid grid-cols-5 gap-1.5 px-1 sm:gap-2">
              {fontSizeOptions.map((size) => (
                <FontSizeButton
                  key={size.id}
                  size={size}
                  isSelected={activeFontSizeValue === size.value}
                  onClick={() => handleSelectFontSize(size)}
                />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Stickers">
          <div className="rounded-[18px] border-2 border-[#05102D] bg-[#FDF9F2] p-2 shadow-[2px_3px_0_#05102D] sm:rounded-[22px] sm:p-2.5 sm:shadow-[3px_4px_0_#05102D]">
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-5 sm:gap-2">
              {mergedStickerOptions.map((sticker) => (
                <StickerButton key={sticker.id} sticker={sticker} onClick={onAddSticker} />
              ))}
            </div>

            <button
              type="button"
              onClick={onClearStickers}
              disabled={selectedPhotoStickers.length === 0}
              className={`
                mt-2.5 w-full rounded-xl border-2 border-[#05102D] py-2 text-xs font-black uppercase tracking-wide sm:mt-3 sm:rounded-2xl sm:py-2.5 sm:text-sm
                transition-[transform,background-color,box-shadow] duration-150 active:translate-y-1 active:shadow-none
                ${
                  selectedPhotoStickers.length > 0
                    ? 'bg-[#05102D] text-[#FDF9F2] md:hover:-translate-y-1 md:hover:bg-[#0A1D4E] md:hover:shadow-[2px_3px_0_#1D56CF]'
                    : 'cursor-not-allowed bg-[#05102D]/15 text-[#05102D]/45'
                }
              `}
            >
              Clear stickers
            </button>
          </div>
        </SectionCard>
      </div>

      <style>{`
        @keyframes customizeDrawerUp {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }

          70% {
            opacity: 1;
            transform: translateY(-4px) scale(1.01);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes customizePanelPop {
          0% {
            opacity: 0;
            transform: translateX(18px) scale(0.96) rotate(1deg);
          }

          70% {
            opacity: 1;
            transform: translateX(-3px) scale(1.01) rotate(-0.4deg);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0deg);
          }
        }

        @keyframes customizeMobileButtonPop {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.96) rotate(-1deg);
          }

          70% {
            opacity: 1;
            transform: translateY(-1px) scale(1.03) rotate(0.7deg);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes customizeCloseWiggle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }

          35% {
            transform: rotate(-5deg) scale(1.04);
          }

          70% {
            transform: rotate(4deg) scale(1.02);
          }
        }

        @keyframes customizeChoicePop {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
          }

          38% {
            transform: translateY(-4px) scale(1.08) rotate(-3deg);
          }

          70% {
            transform: translateY(1px) scale(0.98) rotate(1deg);
          }

          100% {
            transform: translateY(0) scale(1.05) rotate(0deg);
          }
        }

        @keyframes customizeSoftShine {
          0% {
            transform: translateX(-140%) skewX(-18deg);
            opacity: 0;
          }

          40% {
            opacity: 1;
          }

          100% {
            transform: translateX(140%) skewX(18deg);
            opacity: 0;
          }
        }

        .animate-customize-drawer-up {
          animation: customizeDrawerUp 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-customize-panel-pop {
          animation: customizePanelPop 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-customize-mobile-button-pop {
          animation: customizeMobileButtonPop 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-customize-close-wiggle {
          animation: customizeCloseWiggle 1.8s ease-in-out infinite;
        }

        .animate-customize-choice-pop {
          animation: customizeChoicePop 430ms cubic-bezier(0.16, 1, 0.3, 1.12) both;
        }

        .animate-customize-soft-shine {
          animation: customizeSoftShine 1.1s ease-out 2;
        }

        .animate-customize-soft-shine-once {
          animation: customizeSoftShine 850ms ease-out 1;
        }

        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .animate-customize-drawer-up,
          .animate-customize-panel-pop,
          .animate-customize-choice-pop,
          .animate-customize-soft-shine,
          .animate-customize-soft-shine-once,
          .animate-customize-mobile-button-pop,
          .animate-customize-close-wiggle {
            animation: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-customize-drawer-up,
          .animate-customize-panel-pop,
          .animate-customize-choice-pop,
          .animate-customize-soft-shine,
          .animate-customize-soft-shine-once,
          .animate-customize-mobile-button-pop,
          .animate-customize-close-wiggle {
            animation: none !important;
          }
        }
      `}</style>
    </aside>
  );
}

export default StripCustomization;