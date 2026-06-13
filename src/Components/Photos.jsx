import { memo, useEffect, useMemo, useRef, useState } from 'react';

import StripCustomization from './StripCustomization.jsx';

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
import downloadIcon from '../assets/Download.png';
import editIcon from '../assets/Edit.png';
import archiveIcon from '../assets/Archive.png';
import restoreIcon from '../assets/Restore.png';
import deleteIcon from '../assets/Trash.png';
import emptyIcon from '../assets/Polaroid.png';
import stickerIcon from '../assets/PictureShine.png';
import sparkleSticker from '../assets/Shine.png';
import blueStarSticker from '../assets/Shine.png';
import pinkStarSticker from '../assets/Shine.png';
import cameraSticker from '../assets/Camera.png';
import filmSticker from '../assets/Filter.png';
import rainbowSticker from '../assets/Rainbow.png';
import lightningSticker from '../assets/Thermal.png';

const CREAM = '#FDF9F2';
const NAVY = '#05102D';

const actionIcons = {
  save: downloadIcon,
  edit: editIcon,
  archive: archiveIcon,
  restore: restoreIcon,
  delete: deleteIcon,
  empty: emptyIcon,
  sticker: stickerIcon,
};

const stickerOptions = [
  { id: 'sparkle', label: 'Sparkle', src: sparkleSticker },
  { id: 'blue-star', label: 'Blue Star', src: blueStarSticker },
  { id: 'pink-star', label: 'Pink Star', src: pinkStarSticker },
  { id: 'camera', label: 'Camera', src: cameraSticker },
  { id: 'film', label: 'Film', src: filmSticker },
  { id: 'rainbow', label: 'Rainbow', src: rainbowSticker },
  { id: 'lightning', label: 'Thermal', src: lightningSticker },
];

const editStripColors = [
  { id: 'cream', label: 'Cream', value: '#FDF9F2' },
  { id: 'blue', label: 'Blue', value: '#1D56CF' },
  { id: 'pink', label: 'Pink', value: '#F9B8D0' },
  { id: 'yellow', label: 'Yellow', value: '#FFE16A' },
  { id: 'green', label: 'Green', value: '#22C55E' },
  { id: 'purple', label: 'Purple', value: '#A855F7' },
  { id: 'black', label: 'Black', value: '#111827' },
];

const editStripDesigns = [
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

const editFontOptions = [
  {
    id: 'genoir',
    label: 'Genoir',
    family: 'Genoir Black Expanded, Helvetica, Arial, sans-serif',
    preview: 'Photo2y',
  },
  {
    id: 'serif',
    label: 'Serif',
    family: 'Photo2y Serif, Georgia, "Times New Roman", serif',
    preview: 'Photo2y',
  },
  {
    id: 'rounded',
    label: 'Rounded',
    family: 'Photo2y Rounded, Arial Rounded MT Bold, Arial, sans-serif',
    preview: 'Photo2y',
  },
  {
    id: 'bold',
    label: 'Bold',
    family: 'Photo2y Bold, Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
    preview: 'Photo2y',
  },
  {
    id: 'mono',
    label: 'Mono',
    family: 'Photo2y Mono, "Courier New", Courier, monospace',
    preview: 'Photo2y',
  },
  {
    id: 'cute',
    label: 'Cute',
    family: 'Photo2y Cute, Comic Sans MS, Comic Sans, cursive',
    preview: 'Photo2y',
  },
];

const normalizeHex = (hexColor = CREAM) => {
  if (typeof hexColor !== 'string') return CREAM;

  const trimmed = hexColor.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;

  return CREAM;
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

const getPhotoSource = (photo) =>
  photo?.src ||
  photo?.stripUrl ||
  photo?.stripURL ||
  photo?.imageUrl ||
  photo?.imageURL ||
  photo?.photoUrl ||
  photo?.photoURL ||
  photo?.dataUrl ||
  photo?.dataURL ||
  photo?.url ||
  '';

const getFrames = (photo) => {
  if (Array.isArray(photo?.frames) && photo.frames.length) return photo.frames.filter(Boolean);
  if (Array.isArray(photo?.shots) && photo.shots.length) return photo.shots.filter(Boolean);
  if (Array.isArray(photo?.images) && photo.images.length) return photo.images.filter(Boolean);
  if (Array.isArray(photo?.photos) && photo.photos.length) return photo.photos.filter(Boolean);

  const source = getPhotoSource(photo);
  if (source) return [source];

  return [];
};

const normalizePhoto = (photo, index = 0, type = 'photo') => {
  if (!photo) return null;

  const frames = getFrames(photo);
  const source = getPhotoSource(photo) || frames[0] || '';

  if (!source && frames.length === 0) return null;

  const createdAt =
    photo.createdAt ||
    photo.takenAt ||
    photo.timestamp ||
    photo.dateTaken ||
    photo.date ||
    photo.time ||
    new Date().toISOString();

  return {
    ...photo,
    id: photo.id || `${type}-${createdAt}-${source.slice(0, 32)}-${index}`,
    src: source,
    frames: frames.length ? frames : [source],
    label: photo.label || photo.name || photo.title || `Photo Strip ${index + 1}`,
    createdAt,
  };
};

const normalizeSavedStickers = (stickers) => {
  if (!stickers) return [];

  let parsedStickers = stickers;

  if (typeof stickers === 'string') {
    try {
      parsedStickers = JSON.parse(stickers);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedStickers)) return [];

  return parsedStickers
    .filter((sticker) => sticker?.src)
    .map((sticker, index) => ({
      id:
        sticker.id ||
        `saved-sticker-${index}-${sticker.label || 'sticker'}-${String(sticker.src).slice(-24)}`,
      label: sticker.label || 'Sticker',
      src: sticker.src,
      x: Number.isFinite(Number(sticker.x)) ? Number(sticker.x) : 50,
      y: Number.isFinite(Number(sticker.y)) ? Number(sticker.y) : 50,
      rotation: Number.isFinite(Number(sticker.rotation)) ? Number(sticker.rotation) : 0,
    }));
};

const getStripTheme = (photo) => {
  const stripColor = normalizeHex(
    photo?.stripColor ||
      photo?.selectedStripColor ||
      photo?.design?.stripColor ||
      photo?.design?.selectedStripColor ||
      photo?.stripDesign?.stripColor ||
      photo?.stripDesign?.selectedStripColor ||
      CREAM
  );

  const stripImage =
    photo?.stripImage ||
    photo?.selectedStripImage ||
    photo?.design?.stripImage ||
    photo?.design?.selectedStripImage ||
    photo?.stripDesign?.stripImage ||
    photo?.stripDesign?.selectedStripImage ||
    '';

  const stripFont =
    photo?.stripFont ||
    photo?.selectedStripFont ||
    photo?.design?.stripFont ||
    photo?.design?.selectedStripFont ||
    photo?.stripDesign?.stripFont ||
    photo?.stripDesign?.selectedStripFont ||
    editFontOptions[0].family;

  return {
    stripColor,
    stripImage,
    contrastColor: stripImage ? CREAM : getContrastColor(stripColor),
    stripFont,
  };
};

const applyPhotoThemeOverride = (photo, themeOverride = {}) => {
  if (!photo || !themeOverride) return photo;

  return {
    ...photo,
    ...themeOverride,
    selectedStripColor: themeOverride.stripColor || photo.selectedStripColor,
    selectedStripImage:
      themeOverride.stripImage !== undefined ? themeOverride.stripImage : photo.selectedStripImage,
    selectedStripFont: themeOverride.stripFont || photo.selectedStripFont,
    design: {
      ...(photo.design || {}),
      stripColor: themeOverride.stripColor || photo.design?.stripColor,
      selectedStripColor: themeOverride.stripColor || photo.design?.selectedStripColor,
      stripImage:
        themeOverride.stripImage !== undefined ? themeOverride.stripImage : photo.design?.stripImage,
      selectedStripImage:
        themeOverride.stripImage !== undefined
          ? themeOverride.stripImage
          : photo.design?.selectedStripImage,
      stripFont: themeOverride.stripFont || photo.design?.stripFont,
      selectedStripFont: themeOverride.stripFont || photo.design?.selectedStripFont,
    },
    stripDesign: {
      ...(photo.stripDesign || {}),
      stripColor: themeOverride.stripColor || photo.stripDesign?.stripColor,
      selectedStripColor: themeOverride.stripColor || photo.stripDesign?.selectedStripColor,
      stripImage:
        themeOverride.stripImage !== undefined
          ? themeOverride.stripImage
          : photo.stripDesign?.stripImage,
      selectedStripImage:
        themeOverride.stripImage !== undefined
          ? themeOverride.stripImage
          : photo.stripDesign?.selectedStripImage,
      stripFont: themeOverride.stripFont || photo.stripDesign?.stripFont,
      selectedStripFont: themeOverride.stripFont || photo.stripDesign?.selectedStripFont,
    },
  };
};

const getPhotoDateTime = (photo) => {
  const rawDate =
    photo?.takenAt ||
    photo?.createdAt ||
    photo?.timestamp ||
    photo?.dateTaken ||
    photo?.date ||
    photo?.time;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return null;

  const date = parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const time = parsedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${date} • ${time}`;
};

const sanitizeFileName = (name = 'photo-strip') =>
  name
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'photo-strip';

const downloadCanvasAsImage = (canvas, fileName = 'photo-strip.png') => {
  const triggerDownload = (href) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = href;
    link.rel = 'noopener';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (canvas.toBlob) {
    canvas.toBlob((blob) => {
      if (!blob) {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl);
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl);

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 2500);
    }, 'image/png');

    return;
  }

  const dataUrl = canvas.toDataURL('image/png');
  triggerDownload(dataUrl);
};

const loadCanvasImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Missing image source.'));
      return;
    }

    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    if (typeof src === 'string' && !src.startsWith('data:') && !src.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }

    image.src = src;
  });

const drawRoundedRectPath = (context, x, y, width, height, radius) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

const drawCoverImage = (context, image, x, y, width, height, radius = 0) => {
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > boxRatio) {
    sourceWidth = image.height * boxRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / boxRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.save();

  if (radius > 0) {
    drawRoundedRectPath(context, x, y, width, height, radius);
    context.clip();
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );

  context.restore();
};

// Draw image "contain" style, centered at (centerX, centerY), fit within maxWidth x maxHeight
const drawContainImage = (context, image, centerX, centerY, maxWidth, maxHeight) => {
  const imageRatio = image.width / image.height;
  const boxRatio = maxWidth / maxHeight;

  let drawWidth = maxWidth;
  let drawHeight = maxHeight;

  if (imageRatio > boxRatio) {
    drawHeight = maxWidth / imageRatio;
  } else {
    drawWidth = maxHeight * imageRatio;
  }

  context.drawImage(
    image,
    centerX - drawWidth / 2,
    centerY - drawHeight / 2,
    drawWidth,
    drawHeight
  );
};

const drawCenteredText = ({ context, text, x, y, color, font, shadow = true }) => {
  context.save();
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = font;
  context.fillStyle = color;

  if (shadow) {
    context.shadowColor = 'rgba(0, 0, 0, 0.25)';
    context.shadowBlur = 3;
    context.shadowOffsetY = 2;
  }

  context.fillText(text, x, y);
  context.restore();
};

// Helper to determine if a sticker is a large downloaded sticker (7, 8, 9)
const isLargeDownloadedSticker = (sticker) => {
  const stickerId = String(sticker?.id || '').toLowerCase();
  const stickerLabel = String(sticker?.label || '').toLowerCase();
  const stickerSource = String(sticker?.src || '').toLowerCase();

  return (
    stickerId.includes('downloaded-sticker-7') ||
    stickerId.includes('downloaded-sticker-8') ||
    stickerId.includes('downloaded-sticker-9') ||
    stickerLabel === 'sticker 7' ||
    stickerLabel === 'sticker 8' ||
    stickerLabel === 'sticker 9' ||
    stickerSource.includes('sticker7') ||
    stickerSource.includes('sticker8') ||
    stickerSource.includes('sticker9')
  );
};

const downloadExactPhotoStrip = async (photo, stickers = []) => {
  const frames = getFrames(photo);
  if (!frames.length) return;

  const theme = getStripTheme(photo);
  const photoDateTime = getPhotoDateTime(photo);
  const isFourFrameStrip = frames.length >= 4;

  const scale = 3;
  const stripWidth = isFourFrameStrip ? 525 : 630;
  const paddingX = isFourFrameStrip ? 30 : 42;
  const paddingTop = isFourFrameStrip ? 60 : 78;
  const paddingBottom = isFourFrameStrip ? 42 : 54;
  const logoHeight = isFourFrameStrip ? 42 : 56;
  const logoMarginBottom = isFourFrameStrip ? 30 : 36;
  const frameGap = isFourFrameStrip ? 18 : 24;
  const dateHeight = photoDateTime ? (isFourFrameStrip ? 28 : 34) : 0;
  const dateMarginTop = photoDateTime ? (isFourFrameStrip ? 24 : 32) : 0;

  const frameWidth = stripWidth - paddingX * 2;
  const frameHeight = Math.round(frameWidth * 0.75);

  const stripHeight =
    paddingTop +
    logoHeight +
    logoMarginBottom +
    frames.length * frameHeight +
    Math.max(0, frames.length - 1) * frameGap +
    dateMarginTop +
    dateHeight +
    paddingBottom;

  const canvas = document.createElement('canvas');
  canvas.width = stripWidth * scale;
  canvas.height = stripHeight * scale;

  const context = canvas.getContext('2d');
  if (!context) return;

  context.scale(scale, scale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.save();
  drawRoundedRectPath(context, 0, 0, stripWidth, stripHeight, isFourFrameStrip ? 48 : 60);
  context.clip();

  context.fillStyle = theme.stripColor;
  context.fillRect(0, 0, stripWidth, stripHeight);

  if (theme.stripImage) {
    try {
      const backgroundImage = await loadCanvasImage(theme.stripImage);
      drawCoverImage(context, backgroundImage, 0, 0, stripWidth, stripHeight, 0);

      context.fillStyle = 'rgba(5, 16, 45, 0.1)';
      context.fillRect(0, 0, stripWidth, stripHeight);
    } catch {
      context.fillStyle = theme.stripColor;
      context.fillRect(0, 0, stripWidth, stripHeight);
    }
  }

  context.restore();

  context.save();
  drawRoundedRectPath(
    context,
    0.5,
    0.5,
    stripWidth - 1,
    stripHeight - 1,
    isFourFrameStrip ? 48 : 60
  );
  context.lineWidth = 1;
  context.strokeStyle = NAVY;
  context.stroke();
  context.restore();

  drawCenteredText({
    context,
    text: 'Photo2y',
    x: stripWidth / 2,
    y: paddingTop + logoHeight / 2 - 2,
    color: theme.contrastColor,
    font: `900 ${isFourFrameStrip ? 48 : 64}px ${theme.stripFont}`,
  });

  let currentY = paddingTop + logoHeight + logoMarginBottom;

  for (const frame of frames) {
    try {
      const image = await loadCanvasImage(frame);
      drawCoverImage(
        context,
        image,
        paddingX,
        currentY,
        frameWidth,
        frameHeight,
        isFourFrameStrip ? 18 : 24
      );
    } catch {
      context.fillStyle = '#ffffff';
      drawRoundedRectPath(
        context,
        paddingX,
        currentY,
        frameWidth,
        frameHeight,
        isFourFrameStrip ? 18 : 24
      );
      context.fill();
    }

    currentY += frameHeight + frameGap;
  }

  if (photoDateTime) {
    currentY += dateMarginTop - frameGap;

    drawCenteredText({
      context,
      text: photoDateTime.toUpperCase(),
      x: stripWidth / 2,
      y: currentY + dateHeight / 2,
      color: theme.contrastColor,
      font: `900 ${isFourFrameStrip ? 18 : 22}px ${theme.stripFont}`,
    });
  }

  for (const sticker of stickers) {
    const stickerX = (sticker.x / 100) * stripWidth;
    const stickerY = (sticker.y / 100) * stripHeight;
    const stickerSize = isLargeDownloadedSticker(sticker)
      ? isFourFrameStrip
        ? 150
        : 190
      : isFourFrameStrip
        ? 90
        : 116;

    try {
      const stickerImage = await loadCanvasImage(sticker.src);

      context.save();
      context.translate(stickerX, stickerY);
      context.rotate(((sticker.rotation || 0) * Math.PI) / 180);
      drawContainImage(context, stickerImage, 0, 0, stickerSize, stickerSize);
      context.restore();
    } catch (error) {
      console.error('Failed to draw sticker on downloaded photo strip:', sticker, error);
    }
  }

  downloadCanvasAsImage(canvas, `${sanitizeFileName(photo?.label || 'photo-strip')}.png`);
};

const CleanPhotoStrip = memo(function CleanPhotoStrip({
  photo,
  isLarge = false,
  stickers = [],
  onStickerPointerDown,
  isStickerEditable = false,
}) {
  const theme = getStripTheme(photo);
  const frames = getFrames(photo);
  const photoDateTime = getPhotoDateTime(photo);
  const frameCount = frames.length;
  const isFourFrameStrip = frameCount >= 4;

  const stripSizeClass = isLarge
    ? isFourFrameStrip
      ? 'w-full rounded-[18px] px-3 pb-4 pt-6'
      : 'w-full rounded-[20px] px-4 pb-5 pt-7'
    : isFourFrameStrip
      ? 'w-full max-w-[175px] rounded-[16px] px-2.5 pb-3.5 pt-5 shadow-[3px_4px_0_#05102D]'
      : 'w-full max-w-[210px] rounded-[18px] px-3.5 pb-4 pt-6 shadow-[3px_4px_0_#05102D]';

  const logoTextClass = isLarge
    ? isFourFrameStrip
      ? 'text-lg'
      : 'text-2xl'
    : isFourFrameStrip
      ? 'text-base'
      : 'text-xl';

  const frameWrapperClass = isFourFrameStrip
    ? isLarge
      ? 'overflow-hidden rounded-[10px]'
      : 'overflow-hidden rounded-[8px]'
    : isLarge
      ? 'overflow-hidden rounded-[12px]'
      : 'overflow-hidden rounded-[11px]';

  const frameImageClass = isLarge
    ? isFourFrameStrip
      ? 'aspect-[4/3] rounded-[7px]'
      : 'aspect-[4/3] rounded-[8px]'
    : isFourFrameStrip
      ? 'aspect-[4/3] rounded-[6px]'
      : 'aspect-[4/3] rounded-[7px]';

  // Helper to get sticker size class for placed sticker
  const getStickerSizeClass = (sticker) => {
    if (isLargeDownloadedSticker(sticker)) {
      return isLarge
        ? isFourFrameStrip
          ? 'h-[68px] w-[68px] md:h-24 md:w-24'
          : 'h-[88px] w-[88px] md:h-32 md:w-32'
        : isFourFrameStrip
          ? 'h-14 w-14 md:h-20 md:w-20'
          : 'h-20 w-20 md:h-28 md:w-28';
    }

    return isLarge
      ? isFourFrameStrip
        ? 'h-10 w-10 md:h-14 md:w-14'
        : 'h-14 w-14 md:h-20 md:w-20'
      : isFourFrameStrip
        ? 'h-8 w-8 md:h-10 md:w-10'
        : 'h-10 w-10 md:h-14 md:w-14';
  };

  return (
    <div
      data-photo-strip
      className={`relative mx-auto overflow-hidden border border-[#05102D] ${stripSizeClass}`}
      style={{
        backgroundColor: theme.stripColor,
        backgroundImage: getBackgroundImageStyle(theme.stripImage),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {theme.stripImage && (
        <div className="pointer-events-none absolute inset-0 bg-[#05102D]/10" />
      )}

      <div className="relative z-10">
        <div className={`${isFourFrameStrip ? 'mb-3' : 'mb-4.5'} text-center`}>
          <p
            className={`font-black leading-none drop-shadow ${logoTextClass}`}
            style={{ color: theme.contrastColor, fontFamily: theme.stripFont }}
          >
            Photo2y
          </p>
        </div>

        <div className={`flex flex-col ${isFourFrameStrip ? 'gap-1.5' : 'gap-2'}`}>
          {frames.map((frame, index) => (
            <div key={`${photo?.id || 'photo'}-${index}`} className={frameWrapperClass}>
              <img
                src={frame}
                alt={`Frame ${index + 1}`}
                className={`w-full object-cover ${frameImageClass}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {photoDateTime && (
          <div className={`${isFourFrameStrip ? 'mt-2.5' : 'mt-3.5'} text-center`}>
            <p
              className={`
                font-black uppercase leading-none tracking-wide drop-shadow
                ${
                  isLarge
                    ? isFourFrameStrip
                      ? 'text-[7px]'
                      : 'text-[8px]'
                    : isFourFrameStrip
                      ? 'text-[5.5px]'
                      : 'text-[6.5px]'
                }
              `}
              style={{ color: theme.contrastColor, fontFamily: theme.stripFont }}
            >
              {photoDateTime}
            </p>
          </div>
        )}
      </div>

      {stickers.map((sticker) => (
        <button
          key={sticker.id}
          type="button"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={
            isStickerEditable
              ? (event) => onStickerPointerDown?.(event, sticker.id)
              : undefined
          }
          aria-label={isStickerEditable ? `Drag ${sticker.label || 'sticker'} sticker` : undefined}
          className={`
            photo2y-sticker-button photo2y-no-cartoon-animation absolute z-20 flex items-center justify-center rounded-full leading-none transition-transform duration-100
            ${getStickerSizeClass(sticker)}
            ${
              isStickerEditable
                ? 'cursor-grab touch-none select-none active:cursor-grabbing md:hover:scale-110'
                : 'pointer-events-none'
            }
          `}
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`,
            touchAction: 'none',
          }}
        >
          <img
            src={sticker.src}
            alt={sticker.label || 'Sticker'}
            className="pointer-events-none h-full w-full object-contain drop-shadow"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </button>
      ))}
    </div>
  );
});

function IconButton({ icon, label, onClick, variant = 'blue' }) {
  const variants = {
    blue: 'bg-[#1D56CF] hover:bg-[#1746A8]',
    cream: 'bg-[#FDF9F2] hover:bg-white',
    navy: 'bg-[#05102D] hover:bg-[#0A1D4E]',
    danger: 'bg-[#B91C1C] hover:bg-[#991B1B]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`
        photo2y-no-cartoon-animation flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#05102D]
        transition-[transform,background-color,box-shadow] duration-150 ease-out md:h-11 md:w-11 md:rounded-2xl md:hover:-translate-y-1 md:hover:shadow-[3px_4px_0_#05102D]
        active:translate-y-1 active:scale-95 active:shadow-none
        ${variants[variant] || variants.blue}
      `}
    >
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="h-5 w-5 object-contain"
        loading="lazy"
        decoding="async"
      />
    </button>
  );
}

function RenameIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Rename photo strip"
      aria-label="Rename photo strip"
      className="
        photo2y-no-cartoon-animation ml-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#05102D]
        bg-[#FDF9F2] transition-[transform,background-color,box-shadow] duration-150 ease-out md:ml-2 md:h-8 md:w-8 md:rounded-xl
        md:hover:-translate-y-0.5 md:hover:bg-white md:hover:shadow-[2px_3px_0_#05102D]
        active:translate-y-0.5 active:scale-95 active:shadow-none
      "
    >
      <img
        src={actionIcons.edit}
        alt=""
        aria-hidden="true"
        className="h-3.5 w-3.5 object-contain md:h-4 md:w-4"
        loading="lazy"
        decoding="async"
      />
    </button>
  );
}

function TabButton({ label, count, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        photo2y-no-cartoon-animation flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-[#05102D] px-3 py-2
        text-xs font-black uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-150 ease-out md:flex-none md:gap-2 md:rounded-2xl md:px-4 md:py-2.5 md:text-sm
        active:translate-y-1 active:scale-[0.98] active:shadow-none
        ${
          isActive
            ? 'bg-[#1D56CF] text-[#FDF9F2] shadow-[3px_4px_0_#05102D]'
            : 'bg-[#FDF9F2] text-[#05102D] md:hover:-translate-y-1 md:hover:bg-[#1D56CF] md:hover:text-[#FDF9F2] md:hover:shadow-[3px_4px_0_#05102D]'
        }
      `}
    >
      {label}

      <span className="photo2y-count-badge rounded-full bg-[#1D56CF] px-2 py-0.5 text-xs text-[#FDF9F2]">
        {count}
      </span>
    </button>
  );
}

function Photos({
  photos = [],
  archivedPhotos = [],
  onArchivePhoto,
  onRestorePhoto,
  onPermanentDeletePhoto,
  onEditPhoto,
  onDownloadPhoto,
  onSavePhotoStickers,
}) {
  const dragFrameRef = useRef(null);
  const latestDragRef = useRef(null);

  const [activeTab, setActiveTab] = useState('photos');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editedLabel, setEditedLabel] = useState('');
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [photoStickers, setPhotoStickers] = useState({});
  const [photoThemeOverrides, setPhotoThemeOverrides] = useState({});

  const normalizedPhotos = useMemo(
    () => photos.map((photo, index) => normalizePhoto(photo, index, 'photo')).filter(Boolean),
    [photos]
  );

  const normalizedArchivedPhotos = useMemo(
    () =>
      archivedPhotos
        .map((photo, index) => normalizePhoto(photo, index, 'archive'))
        .filter(Boolean),
    [archivedPhotos]
  );

  const savedStickerMap = useMemo(() => {
    const nextStickerMap = {};

    [...normalizedPhotos, ...normalizedArchivedPhotos].forEach((photo) => {
      if (!photo?.id) return;
      nextStickerMap[photo.id] = normalizeSavedStickers(photo.stickers || photo.photoStickers);
    });

    return nextStickerMap;
  }, [normalizedPhotos, normalizedArchivedPhotos]);

  useEffect(() => {
    setPhotoStickers((current) => {
      const merged = { ...current };

      Object.entries(savedStickerMap).forEach(([photoId, stickers]) => {
        if (!merged[photoId] && stickers.length) {
          merged[photoId] = stickers;
        }
      });

      return merged;
    });
  }, [savedStickerMap]);

  const visiblePhotos = activeTab === 'photos' ? normalizedPhotos : normalizedArchivedPhotos;

  const getDisplayPhoto = (photo) => applyPhotoThemeOverride(photo, photoThemeOverrides[photo.id]);

  const getSavedStickersForPhoto = (photo) => {
    if (!photo?.id) return [];
    return photoStickers[photo.id] || savedStickerMap[photo.id] || [];
  };

  const selectedDisplayPhoto = selectedPhoto ? getDisplayPhoto(selectedPhoto) : null;
  const selectedPhotoStickers = selectedPhoto ? getSavedStickersForPhoto(selectedPhoto) : [];
  const selectedFrameCount = selectedDisplayPhoto ? getFrames(selectedDisplayPhoto).length : 0;
  const isSelectedFourFrameStrip = selectedFrameCount >= 4;
  const selectedStripTheme = selectedDisplayPhoto ? getStripTheme(selectedDisplayPhoto) : null;

  const persistPhotoStickers = (photoId, stickers) => {
    if (!photoId) return;
    onSavePhotoStickers?.(photoId, stickers);
  };

  const handleStartEdit = (photo) => {
    setEditingPhoto(photo);
    setEditedLabel(photo.label || '');
  };

  const handleSaveEdit = () => {
    if (!editingPhoto || !editedLabel.trim()) return;

    onEditPhoto?.(editingPhoto.id, editedLabel.trim());
    setEditingPhoto(null);
    setEditedLabel('');
  };

  const handleCancelEdit = () => {
    setEditingPhoto(null);
    setEditedLabel('');
  };

  const handleOpenPreview = (photo, openEditPanel = false) => {
    setSelectedPhoto(photo);
    setIsEditPanelOpen(openEditPanel);
  };

  const handleClosePreview = () => {
    setSelectedPhoto(null);
    setIsEditPanelOpen(false);
  };

  const handleDownloadPhoto = async (photo) => {
    const displayPhoto = getDisplayPhoto(photo);
    const stickers = getSavedStickersForPhoto(photo);

    try {
      await downloadExactPhotoStrip(displayPhoto, stickers);
    } catch (error) {
      console.error('Failed to download photo strip with stickers:', error);
      onDownloadPhoto?.(displayPhoto, stickers);
    }
  };

  const handleAddSticker = (sticker) => {
    if (!selectedPhoto) return;

    const newSticker = {
      id: `${Date.now()}-${Math.random()}`,
      label: sticker.label,
      src: sticker.src,
      x: 50,
      y: 50,
      rotation: Math.random() > 0.5 ? -8 : 8,
    };

    setPhotoStickers((current) => {
      const nextStickers = [
        ...(current[selectedPhoto.id] ||
          savedStickerMap[selectedPhoto.id] ||
          normalizeSavedStickers(selectedPhoto.stickers || selectedPhoto.photoStickers)),
        newSticker,
      ];

      persistPhotoStickers(selectedPhoto.id, nextStickers);

      return {
        ...current,
        [selectedPhoto.id]: nextStickers,
      };
    });
  };

  const handleClearStickers = () => {
    if (!selectedPhoto) return;

    setPhotoStickers((current) => {
      persistPhotoStickers(selectedPhoto.id, []);

      return {
        ...current,
        [selectedPhoto.id]: [],
      };
    });
  };

  const handleSelectStripColor = (color) => {
    if (!selectedPhoto) return;

    setPhotoThemeOverrides((current) => ({
      ...current,
      [selectedPhoto.id]: {
        ...(current[selectedPhoto.id] || {}),
        stripColor: color.value,
        stripImage: '',
      },
    }));
  };

  const handleSelectStripDesign = (design) => {
    if (!selectedPhoto) return;

    setPhotoThemeOverrides((current) => ({
      ...current,
      [selectedPhoto.id]: {
        ...(current[selectedPhoto.id] || {}),
        stripColor: CREAM,
        stripImage: design.value,
      },
    }));
  };

  const handleSelectStripFont = (font) => {
    if (!selectedPhoto) return;

    setPhotoThemeOverrides((current) => ({
      ...current,
      [selectedPhoto.id]: {
        ...(current[selectedPhoto.id] || {}),
        stripFont: font.family,
      },
    }));
  };

  const updateDraggedSticker = ({ selectedPhotoId, stickerId, x, y }) => {
    setPhotoStickers((current) => {
      const currentStickers =
        current[selectedPhotoId] ||
        savedStickerMap[selectedPhotoId] ||
        normalizeSavedStickers(selectedPhoto?.stickers || selectedPhoto?.photoStickers);

      const nextStickers = currentStickers.map((sticker) =>
        sticker.id === stickerId
          ? {
              ...sticker,
              x,
              y,
            }
          : sticker
      );

      latestDragRef.current = {
        selectedPhotoId,
        stickers: nextStickers,
      };

      return {
        ...current,
        [selectedPhotoId]: nextStickers,
      };
    });
  };

  const handleStickerPointerDown = (event, stickerId) => {
    if (!selectedPhoto) return;

    event.preventDefault();
    event.stopPropagation();

    const selectedPhotoId = selectedPhoto.id;
    const stickerButton = event.currentTarget;
    const stripElement = stickerButton.closest('[data-photo-strip]');

    if (!stripElement) return;

    try {
      stickerButton.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can fail on some browsers.
    }

    const updateStickerPosition = (pointerEvent) => {
      const rect = stripElement.getBoundingClientRect();

      const x = ((pointerEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((pointerEvent.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      latestDragRef.current = {
        selectedPhotoId,
        stickerId,
        x: clampedX,
        y: clampedY,
      };

      if (dragFrameRef.current) return;

      dragFrameRef.current = requestAnimationFrame(() => {
        dragFrameRef.current = null;

        const latestDrag = latestDragRef.current;
        if (!latestDrag || latestDrag.selectedPhotoId !== selectedPhotoId) return;

        updateDraggedSticker({
          selectedPhotoId,
          stickerId,
          x: latestDrag.x,
          y: latestDrag.y,
        });
      });
    };

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      updateStickerPosition(moveEvent);
    };

    const stopDragging = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);

      if (dragFrameRef.current) {
        cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }

      const latestDrag = latestDragRef.current;

      if (latestDrag?.stickerId === stickerId) {
        updateDraggedSticker({
          selectedPhotoId,
          stickerId,
          x: latestDrag.x,
          y: latestDrag.y,
        });
      }

      setPhotoStickers((current) => {
        const stickersToSave =
          current[selectedPhotoId] ||
          latestDragRef.current?.stickers ||
          savedStickerMap[selectedPhotoId] ||
          normalizeSavedStickers(selectedPhoto.stickers || selectedPhoto.photoStickers);

        persistPhotoStickers(selectedPhotoId, stickersToSave);
        return current;
      });

      try {
        stickerButton.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release failures.
      }
    };

    updateStickerPosition(event);
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
  };

  return (
    <section className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain bg-[#FDF9F2] px-3 py-4 pb-40 text-[#05102D] touch-pan-y [-webkit-overflow-scrolling:touch] md:px-8 md:py-10 md:pb-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-5">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#05102D]/55 md:mb-2 md:text-sm md:tracking-[0.25em]">
              Gallery
            </p>

            <h2 className="font-serif text-4xl font-black leading-none tracking-[-0.04em] text-[#1D56CF] md:motion-safe:animate-photos-title-pop md:text-7xl">
              Photos
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
            <TabButton
              label="Photos"
              count={normalizedPhotos.length}
              isActive={activeTab === 'photos'}
              onClick={() => setActiveTab('photos')}
            />

            <TabButton
              label="Archive"
              count={normalizedArchivedPhotos.length}
              isActive={activeTab === 'archive'}
              onClick={() => setActiveTab('archive')}
            />
          </div>
        </div>

        <div className="rounded-[24px] border-2 border-[#05102D] bg-white/45 p-2.5 shadow-[3px_4px_0_#05102D] md:rounded-[34px] md:p-6 md:shadow-[8px_10px_0_#05102D]">
          <div className="min-h-[320px] rounded-[20px] border-2 border-dashed border-[#05102D]/30 bg-[#FDF9F2] p-2.5 md:min-h-[430px] md:rounded-[28px] md:p-6">
            {visiblePhotos.length === 0 ? (
              <div className="flex min-h-[270px] flex-col items-center justify-center text-center md:min-h-[360px]">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] border-2 border-[#05102D] bg-[#1D56CF] shadow-[3px_4px_0_#05102D] md:mb-5 md:h-24 md:w-24 md:rounded-[30px] md:shadow-[5px_6px_0_#05102D] md:motion-safe:animate-empty-photo-float">
                  <img
                    src={actionIcons.empty}
                    alt=""
                    className="h-10 w-10 md:h-11 md:w-11"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <p className="mb-2 text-2xl font-black text-[#1D56CF]">
                  {activeTab === 'photos' ? 'No photos yet' : 'Archive is empty'}
                </p>

                <p className="max-w-sm text-sm font-bold text-[#05102D]/55">
                  {activeTab === 'photos'
                    ? 'Your captured photo strips will appear here.'
                    : 'Archived photo strips will appear here once you archive them.'}
                </p>
              </div>
            ) : (
              <div className="overflow-visible pb-10 pt-1 touch-pan-y md:overflow-x-auto md:overflow-y-hidden md:pb-4 md:pt-2">
                <div className="grid grid-cols-1 gap-3 touch-pan-y sm:grid-cols-2 md:flex md:w-max md:gap-8">
                  {visiblePhotos.map((photo, index) => {
                    const displayPhoto = getDisplayPhoto(photo);
                    const frameCount = getFrames(displayPhoto).length;
                    const isFourFrameStrip = frameCount >= 4;

                    return (
                      <div
                        key={photo.id || `${activeTab}-${index}`}
                        className="
                          photo2y-no-cartoon-animation group flex min-w-0 flex-col rounded-[20px] border-2 border-[#05102D]
                          bg-[#FDF9F2] p-3 shadow-[2px_3px_0_#05102D]
                          transition-[transform,box-shadow] duration-150 ease-out md:w-[280px] md:shrink-0 md:rounded-[28px] md:p-4 md:shadow-[5px_6px_0_#05102D] md:motion-safe:animate-photo-card-pop md:hover:-translate-y-1 md:hover:shadow-[7px_8px_0_#05102D]
                        "
                      >
                        <div className="mb-2 flex min-h-[32px] items-center justify-center text-center md:mb-4 md:min-h-[42px]">
                          <p className="line-clamp-1 text-xs font-black uppercase tracking-wide text-[#05102D] md:text-sm">
                            {photo.label || `Photo Strip ${index + 1}`}
                          </p>

                          <RenameIconButton onClick={() => handleStartEdit(photo)} />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenPreview(photo)}
                          className={`
                            photo2y-no-cartoon-animation flex w-full touch-pan-y items-center justify-center rounded-[18px] bg-[#FDF9F2] p-2
                            transition-[transform,background-color] duration-150 active:scale-[0.99] md:rounded-[22px] md:p-4 md:hover:bg-white
                            ${isFourFrameStrip ? 'min-h-[320px] md:min-h-[440px]' : 'min-h-[250px] md:min-h-[330px]'}
                          `}
                        >
                          <CleanPhotoStrip
                            photo={displayPhoto}
                            stickers={getSavedStickersForPhoto(photo)}
                          />
                        </button>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t-2 border-dashed border-[#05102D]/20 pt-3 md:mt-auto md:gap-3 md:pt-4">
                          {activeTab === 'photos' ? (
                            <>
                              <IconButton
                                icon={actionIcons.save}
                                label="Download"
                                onClick={() => handleDownloadPhoto(photo)}
                                variant="blue"
                              />

                              <IconButton
                                icon={actionIcons.sticker}
                                label="Edit photo strip"
                                onClick={() => handleOpenPreview(photo, true)}
                                variant="cream"
                              />

                              <IconButton
                                icon={actionIcons.archive}
                                label="Archive"
                                onClick={() => onArchivePhoto?.(photo.id)}
                                variant="navy"
                              />
                            </>
                          ) : (
                            <>
                              <IconButton
                                icon={actionIcons.restore}
                                label="Restore"
                                onClick={() => onRestorePhoto?.(photo.id)}
                                variant="cream"
                              />

                              <IconButton
                                icon={actionIcons.sticker}
                                label="Edit photo strip"
                                onClick={() => handleOpenPreview(photo, true)}
                                variant="cream"
                              />

                              <IconButton
                                icon={actionIcons.delete}
                                label="Delete permanently"
                                onClick={() => onPermanentDeletePhoto?.(photo.id)}
                                variant="danger"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPhoto && selectedDisplayPhoto && (
        <div
          className="fixed inset-0 z-[100] block h-dvh max-h-dvh overflow-y-auto overflow-x-hidden overscroll-contain bg-[#05102D]/85 p-2 [-webkit-overflow-scrolling:touch] md:flex md:items-center md:justify-center md:p-3"
          onClick={handleClosePreview}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`
              relative z-10 mx-auto grid min-h-0 w-full gap-2 overflow-visible py-3 md:max-h-[94dvh] md:overflow-hidden md:py-0 md:gap-5
              ${
                isEditPanelOpen
                  ? 'max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'
                  : 'max-w-[min(100%,420px)] grid-cols-1 md:max-w-xl'
              }
            `}
          >
            <div className="relative flex min-h-0 flex-col items-center justify-center gap-2 p-1 md:motion-safe:animate-edit-preview-pop md:p-2">
              <button
                type="button"
                onClick={() => handleDownloadPhoto(selectedPhoto)}
                className="photo2y-no-cartoon-animation flex items-center justify-center gap-2 rounded-xl border-2 border-[#05102D] bg-[#1D56CF] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#FDF9F2] shadow-[2px_3px_0_#05102D] transition-[transform,background-color,box-shadow] duration-150 md:hidden active:translate-y-1 active:scale-[0.98] active:shadow-none"
              >
                <img
                  src={actionIcons.save}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                Download
              </button>

              <div
                data-photo-strip-preview
                className={`
                  w-full
                  ${
                    isSelectedFourFrameStrip
                      ? isEditPanelOpen
                        ? 'max-w-[190px] sm:max-w-[210px] lg:max-w-[230px] xl:max-w-[245px]'
                        : 'max-w-[190px] sm:max-w-[220px] md:max-w-[235px]'
                      : isEditPanelOpen
                        ? 'max-w-[285px] sm:max-w-[310px] lg:max-w-[335px] xl:max-w-[360px]'
                        : 'max-w-[265px] sm:max-w-[320px] md:max-w-[340px]'
                  }
                `}
              >
                <CleanPhotoStrip
                  photo={selectedDisplayPhoto}
                  isLarge
                  stickers={selectedPhotoStickers}
                  onStickerPointerDown={handleStickerPointerDown}
                  isStickerEditable
                />
              </div>
            </div>

            {isEditPanelOpen && (
              <StripCustomization
                selectedStripTheme={selectedStripTheme}
                selectedPhotoStickers={selectedPhotoStickers}
                editStripColors={editStripColors}
                editStripDesigns={editStripDesigns}
                editFontOptions={editFontOptions}
                stickerOptions={stickerOptions}
                onSelectStripColor={handleSelectStripColor}
                onSelectStripDesign={handleSelectStripDesign}
                onSelectStripFont={handleSelectStripFont}
                onAddSticker={handleAddSticker}
                onClearStickers={handleClearStickers}
                onClose={handleClosePreview}
                getBackgroundImageStyle={getBackgroundImageStyle}
                cream={CREAM}
              />
            )}
          </div>
        </div>
      )}

      {editingPhoto && (
        <div className="fixed inset-0 z-[110] block h-dvh max-h-dvh overflow-y-auto overflow-x-hidden overscroll-contain bg-[#05102D]/90 p-3 [-webkit-overflow-scrolling:touch] md:flex md:items-center md:justify-center md:p-4">
          <div className="mx-auto mt-[18vh] w-full max-w-md rounded-t-[28px] border-2 border-[#05102D] bg-[#FDF9F2] p-4 text-[#05102D] shadow-[4px_5px_0_#1D56CF] md:mt-0 md:rounded-[34px] md:p-6 md:shadow-[8px_10px_0_#1D56CF] md:motion-safe:animate-mobile-sheet-up">
            <h3 className="mb-1 font-serif text-3xl font-black text-[#1D56CF] md:mb-2 md:text-4xl">
              Rename
            </h3>

            <p className="mb-4 text-xs font-bold text-[#05102D]/60 md:mb-5 md:text-sm">
              Give this photo strip a new name.
            </p>

            <input
              type="text"
              value={editedLabel}
              onChange={(event) => setEditedLabel(event.target.value)}
              className="mb-4 w-full rounded-xl border-2 border-[#05102D] bg-[#FDF9F2] px-3 py-2.5 font-bold text-[#05102D] outline-none transition-shadow focus:shadow-[2px_3px_0_#05102D] md:mb-5 md:rounded-2xl md:px-4 md:py-3 md:focus:shadow-[3px_4px_0_#05102D]"
              placeholder="Enter photo name"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="photo2y-no-cartoon-animation rounded-xl border-2 border-[#05102D] bg-[#FDF9F2] py-2.5 text-sm font-black uppercase tracking-wide text-[#05102D] transition-[transform,background-color,box-shadow] duration-150 md:rounded-2xl md:py-3 md:hover:-translate-y-1 md:hover:bg-white md:hover:shadow-[3px_4px_0_#05102D] active:translate-y-1 active:scale-[0.98] active:shadow-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editedLabel.trim()}
                className={`
                  photo2y-no-cartoon-animation rounded-xl border-2 border-[#05102D] py-2.5 text-sm font-black uppercase tracking-wide
                  transition-[transform,background-color,box-shadow] duration-150 md:rounded-2xl md:py-3 active:translate-y-1 active:scale-[0.98] active:shadow-none
                  ${
                    editedLabel.trim()
                      ? 'bg-[#1D56CF] text-[#FDF9F2] md:hover:-translate-y-1 md:hover:bg-[#1746A8] md:hover:shadow-[3px_4px_0_#05102D]'
                      : 'cursor-not-allowed bg-[#05102D]/15 text-[#05102D]/45'
                  }
                `}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes editPanelPop {
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

        @keyframes editPreviewPop {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.97) rotate(-0.5deg);
          }

          70% {
            opacity: 1;
            transform: translateY(-2px) scale(1.01) rotate(0.3deg);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes photoCardPop {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes photosTitlePop {
          0% {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes emptyPhotoFloat {
          0%, 100% {
            transform: translateY(0) rotate(-1deg);
          }

          50% {
            transform: translateY(-5px) rotate(1deg);
          }
        }

        @keyframes mobileSheetUp {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-edit-panel-pop {
          animation: editPanelPop 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-edit-preview-pop {
          animation: editPreviewPop 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-photo-card-pop {
          animation: photoCardPop 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-photos-title-pop {
          animation: photosTitlePop 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-empty-photo-float {
          animation: emptyPhotoFloat 2.4s ease-in-out infinite;
        }

        .animate-mobile-sheet-up {
          animation: mobileSheetUp 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .animate-edit-panel-pop,
          .animate-edit-preview-pop,
          .animate-photo-card-pop,
          .animate-photos-title-pop,
          .animate-empty-photo-float,
          .animate-mobile-sheet-up {
            animation: none !important;
          }

          .photo2y-sticker-button {
            transition: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-edit-panel-pop,
          .animate-edit-preview-pop,
          .animate-photo-card-pop,
          .animate-photos-title-pop,
          .animate-empty-photo-float,
          .animate-mobile-sheet-up {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Photos;