import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

const CREAM = '#FDF9F2';
const NAVY = '#05102D';
const NEWJEANS_BLUE = '#1B2F73';
const HALFTONE_CREAM = '#F4F0E8';

const clamp = (value) => Math.max(0, Math.min(255, value));

const getCoverCrop = (sourceWidth, sourceHeight, outputWidth, outputHeight, zoomOut = 1) => {
  const sourceRatio = sourceWidth / sourceHeight;
  const outputRatio = outputWidth / outputHeight;

  if (sourceRatio > outputRatio) {
    const coverWidth = sourceHeight * outputRatio;
    const drawWidth = Math.min(sourceWidth, coverWidth * zoomOut);
    const drawHeight = Math.min(sourceHeight, drawWidth / outputRatio);

    return {
      offsetX: (sourceWidth - drawWidth) / 2,
      offsetY: (sourceHeight - drawHeight) / 2,
      drawWidth,
      drawHeight,
    };
  }

  const coverHeight = sourceWidth / outputRatio;
  const drawHeight = Math.min(sourceHeight, coverHeight * zoomOut);
  const drawWidth = Math.min(sourceWidth, drawHeight * outputRatio);

  return {
    offsetX: (sourceWidth - drawWidth) / 2,
    offsetY: (sourceHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
};

const adjustContrast = (value, amount = 1) => {
  return (value - 128) * amount + 128;
};

const mix = (value, target, amount) => {
  return value * (1 - amount) + target * amount;
};

const hexToRgb = (hexColor = NAVY) => {
  const hex = hexColor.replace('#', '');

  return {
    red: parseInt(hex.slice(0, 2), 16),
    green: parseInt(hex.slice(2, 4), 16),
    blue: parseInt(hex.slice(4, 6), 16),
  };
};

const rgbToRgba = (hexColor = NAVY, alpha = 1) => {
  const { red, green, blue } = hexToRgb(hexColor);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const BLACK_WHITE_SHADOW_COLORS = {
  yellow: {
    red: 255,
    green: 196,
    blue: 35,
    edge: 'rgba(255,196,35,0.13)',
    edgeSoft: 'rgba(255,216,82,0.06)',
    shadow: 'rgba(84,50,0,0.5)',
    speck: 'rgba(255,210,70,0.42)',
  },
  green: {
    red: 70,
    green: 235,
    blue: 122,
    edge: 'rgba(70,235,122,0.13)',
    edgeSoft: 'rgba(126,255,166,0.055)',
    shadow: 'rgba(0,70,28,0.5)',
    speck: 'rgba(112,255,158,0.38)',
  },
  blue: {
    red: 50,
    green: 128,
    blue: 255,
    edge: 'rgba(50,128,255,0.14)',
    edgeSoft: 'rgba(105,170,255,0.06)',
    shadow: 'rgba(0,32,92,0.52)',
    speck: 'rgba(105,170,255,0.4)',
  },
};

const getBlackWhiteShadowColor = (selectedColor = 'yellow') => {
  return BLACK_WHITE_SHADOW_COLORS[selectedColor] || BLACK_WHITE_SHADOW_COLORS.yellow;
};

const getIsMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches;
};

const getPreviewSize = (isMobilePreview = false, filterType = 'classic') => {
  if (isMobilePreview) {
    if (filterType === 'dither') {
      return {
        width: 520,
        height: 390,
      };
    }

    return {
      width: 320,
      height: 240,
    };
  }

  return {
    width: 900,
    height: 675,
  };
};

const getPreviewFrameInterval = (filterType, isMobilePreview = false) => {
  if (!isMobilePreview) return 1000 / 30;

  const expensiveFilters = new Set(['dither', 'greenNight', 'thermal', 'pixel', 'dream']);
  return expensiveFilters.has(filterType) ? 1000 / 8 : 1000 / 12;
};

const getIsMobileFilterCanvas = (width, height) => width <= 560 || height <= 420;

const isVideoDrawable = (video) => {
  return Boolean(
    video &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !video.ended
  );
};

const addFineGrain = (context, width, height, intensity = 1) => {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const strength = 7 * intensity;

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * strength;

    data[i] = clamp(data[i] + grain);
    data[i + 1] = clamp(data[i + 1] + grain);
    data[i + 2] = clamp(data[i + 2] + grain);
  }

  context.putImageData(imageData, 0, 0);
};

const addVisibleGrainDots = (context, width, height, intensity = 1) => {
  const isMobileFilterCanvas = getIsMobileFilterCanvas(width, height);
  const dotCount = Math.floor((width * height * intensity) / (isMobileFilterCanvas ? 1280 : 780));

  context.save();

  for (let i = 0; i < dotCount; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = isMobileFilterCanvas ? Math.random() * 0.8 + 0.25 : Math.random() * 1.9 + 0.55;
    const isLight = Math.random() > 0.52;

    context.globalAlpha = Math.random() * 0.2 + 0.06;
    context.fillStyle = isLight ? CREAM : NAVY;
    context.fillRect(x, y, size, size);
  }

  context.restore();
};

const addSoftChromaticShift = (context, width, height, intensity = 1) => {
  context.save();
  context.globalAlpha = 0.035 * intensity;
  context.globalCompositeOperation = 'screen';

  context.fillStyle = 'rgba(29, 86, 207, 0.55)';
  context.fillRect(2, 0, width, height);

  context.fillStyle = 'rgba(249, 184, 208, 0.45)';
  context.fillRect(-2, 0, width, height);

  context.restore();
};

const addTexture = (context, width, height, intensity = 1, visibleDots = 0) => {
  addFineGrain(context, width, height, intensity);
  addSoftChromaticShift(context, width, height, intensity);

  if (visibleDots > 0) {
    addVisibleGrainDots(context, width, height, visibleDots);
  }
};

const posterizeValue = (value, levels = 4) => {
  const step = 255 / (levels - 1);
  return Math.round(value / step) * step;
};

const addVignette = (context, width, height, color = 'rgba(0,0,0,0.28)', size = 0.78) => {
  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.1,
    width / 2,
    height / 2,
    width * size
  );

  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, color);

  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
};

const applyFishEyeWarp = (context, width, height, strength = 0.22) => {
  const sourceCanvas = document.createElement('canvas');
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });

  if (!sourceContext) return;

  sourceCanvas.width = width;
  sourceCanvas.height = height;
  sourceContext.drawImage(context.canvas, 0, 0, width, height);

  const sourceData = sourceContext.getImageData(0, 0, width, height);
  const outputData = context.createImageData(width, height);
  const src = sourceData.data;
  const dst = outputData.data;
  const centerX = width / 2;
  const centerY = height / 2;
  const lensRadius = Math.min(width, height) * 0.52;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy) / lensRadius;
      const outputIndex = (y * width + x) * 4;

      if (radius > 1) {
        dst[outputIndex] = 0;
        dst[outputIndex + 1] = 0;
        dst[outputIndex + 2] = 0;
        dst[outputIndex + 3] = 255;
        continue;
      }

      const angle = Math.atan2(dy, dx);
      const barrelRadius = Math.pow(radius, 1 + strength * 0.22);
      const sourceX = Math.round(centerX + Math.cos(angle) * barrelRadius * lensRadius);
      const sourceY = Math.round(centerY + Math.sin(angle) * barrelRadius * lensRadius);

      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const sourceIndex = (sourceY * width + sourceX) * 4;

        dst[outputIndex] = src[sourceIndex];
        dst[outputIndex + 1] = src[sourceIndex + 1];
        dst[outputIndex + 2] = src[sourceIndex + 2];
        dst[outputIndex + 3] = src[sourceIndex + 3];
      } else {
        dst[outputIndex] = 0;
        dst[outputIndex + 1] = 0;
        dst[outputIndex + 2] = 0;
        dst[outputIndex + 3] = 255;
      }
    }
  }

  context.putImageData(outputData, 0, 0);
};

const addFishEyeLensShade = (context, width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const lensRadius = Math.min(width, height) * 0.52;

  context.save();

  const edgeShade = context.createRadialGradient(
    centerX,
    centerY,
    lensRadius * 0.52,
    centerX,
    centerY,
    lensRadius
  );

  edgeShade.addColorStop(0, 'rgba(0,0,0,0)');
  edgeShade.addColorStop(0.68, 'rgba(0,0,0,0.08)');
  edgeShade.addColorStop(0.9, 'rgba(0,0,0,0.42)');
  edgeShade.addColorStop(1, 'rgba(0,0,0,0.92)');

  context.globalCompositeOperation = 'multiply';
  context.fillStyle = edgeShade;
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = 'screen';
  context.globalAlpha = 0.18;
  context.strokeStyle = 'rgba(29,86,207,0.9)';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(centerX, centerY, lensRadius - 3, 0, Math.PI * 2);
  context.stroke();

  context.globalAlpha = 0.1;
  context.strokeStyle = 'rgba(253,249,242,0.75)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(centerX, centerY, lensRadius - 9, 0, Math.PI * 2);
  context.stroke();

  context.restore();
};

const addSoftLightOverlay = (context, width, height, color, alpha = 0.12) => {
  context.save();
  context.globalAlpha = alpha;
  context.globalCompositeOperation = 'soft-light';
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.restore();
};

const addScreenOverlay = (context, width, height, color, alpha = 0.12) => {
  context.save();
  context.globalAlpha = alpha;
  context.globalCompositeOperation = 'screen';
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.restore();
};

const addMultiplyOverlay = (context, width, height, color, alpha = 0.12) => {
  context.save();
  context.globalAlpha = alpha;
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.restore();
};

const addBlueHalftone = (context, width, height, options = {}) => {
  const isMobileFilterCanvas = getIsMobileFilterCanvas(width, height);

  const {
    spacing = isMobileFilterCanvas ? 2.7 : 4.2,
    maxRadius = isMobileFilterCanvas ? 0.72 : 1.65,
    alpha = 0.72,
    blue = NEWJEANS_BLUE,
    thresholdBoost = -4,
  } = options;

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  context.save();
  context.fillStyle = blue;
  context.globalAlpha = alpha;

  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      const sourceX = Math.min(width - 1, Math.floor(x));
      const sourceY = Math.min(height - 1, Math.floor(y));
      const index = (sourceY * width + sourceX) * 4;

      const red = data[index];
      const green = data[index + 1];
      const blueValue = data[index + 2];
      const brightness = red * 0.299 + green * 0.587 + blueValue * 0.114;
      const darkness = clamp(255 - brightness + thresholdBoost) / 255;

      if (darkness > 0.14) {
        const radius = Math.max(0.18, darkness * maxRadius);
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  context.restore();
};

const applyPixelArtGrid = (context, width, height) => {
  const pixelCanvas = document.createElement('canvas');
  const pixelContext = pixelCanvas.getContext('2d');
  const scale = getIsMobileFilterCanvas(width, height) ? 0.24 : 0.14;

  if (!pixelContext) return;

  pixelCanvas.width = Math.max(1, Math.floor(width * scale));
  pixelCanvas.height = Math.max(1, Math.floor(height * scale));

  pixelContext.imageSmoothingEnabled = false;
  pixelContext.drawImage(context.canvas, 0, 0, pixelCanvas.width, pixelCanvas.height);

  const pixelData = pixelContext.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);
  const data = pixelData.data;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const luma = red * 0.299 + green * 0.587 + blue * 0.114;
    const shadow = 1 - clamp(luma) / 255;
    const highlight = clamp(luma) / 255;

    const contrastedRed = adjustContrast(red, 1.72);
    const contrastedGreen = adjustContrast(green, 1.68);
    const contrastedBlue = adjustContrast(blue, 1.76);

    data[i] = posterizeValue(contrastedRed + highlight * 10 - shadow * 8, 5);
    data[i + 1] = posterizeValue(contrastedGreen + highlight * 8 - shadow * 8, 5);
    data[i + 2] = posterizeValue(contrastedBlue + highlight * 12 - shadow * 10, 5);
  }

  pixelContext.putImageData(pixelData, 0, 0);

  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = false;
  context.drawImage(pixelCanvas, 0, 0, width, height);
  context.imageSmoothingEnabled = true;

  const cellWidth = width / pixelCanvas.width;
  const cellHeight = height / pixelCanvas.height;

  context.save();

  context.globalAlpha = 0.18;
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = '#050505';
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.1;
  context.globalCompositeOperation = 'screen';
  context.fillStyle = '#FDF9F2';
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 0.22;
  context.strokeStyle = '#050505';
  context.lineWidth = 0.85;

  for (let x = 0; x <= width; x += cellWidth) {
    context.beginPath();
    context.moveTo(Math.round(x) + 0.5, 0);
    context.lineTo(Math.round(x) + 0.5, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += cellHeight) {
    context.beginPath();
    context.moveTo(0, Math.round(y) + 0.5);
    context.lineTo(width, Math.round(y) + 0.5);
    context.stroke();
  }

  context.globalAlpha = 0.08;
  context.globalCompositeOperation = 'screen';
  context.fillStyle = '#35A7F2';
  context.fillRect(0, 0, width, height);

  context.restore();
};

const applyOrderedDither = (context, width, height, ditherColor = NAVY, settings = {}) => {
  const sourceCanvas = document.createElement('canvas');
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });

  if (!sourceContext) return;

  const isMobileFilterCanvas = getIsMobileFilterCanvas(width, height);
  const dotSpacing = settings.dotSpacing || (isMobileFilterCanvas ? 3.35 : 4.4);
  const maxDotRadius = settings.maxDotRadius || dotSpacing * (isMobileFilterCanvas ? 0.4 : 0.54);
  const minDotRadius = settings.minDotRadius || (isMobileFilterCanvas ? 0.22 : 0.28);
  const contrastAmount = settings.contrast || (isMobileFilterCanvas ? 1.22 : 1.38);
  const exposureBoost = settings.exposure || (isMobileFilterCanvas ? 16 : 12);
  const whiteCutoff = settings.whiteCutoff || (isMobileFilterCanvas ? 232 : 238);
  const detailCutoff = settings.detailCutoff || (isMobileFilterCanvas ? 0.075 : 0.055);
  const ink = hexToRgb(ditherColor);
  const paperColor = '#FFFFFF';

  sourceCanvas.width = width;
  sourceCanvas.height = height;
  sourceContext.drawImage(context.canvas, 0, 0, width, height);

  const sourceData = sourceContext.getImageData(0, 0, width, height);
  const data = sourceData.data;

  context.clearRect(0, 0, width, height);
  context.fillStyle = paperColor;
  context.fillRect(0, 0, width, height);

  context.save();
  context.fillStyle = `rgb(${ink.red}, ${ink.green}, ${ink.blue})`;

  for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
    const rowIndex = Math.floor(y / dotSpacing);
    const rowOffset = rowIndex % 2 === 0 ? 0 : dotSpacing * 0.5;

    for (let x = dotSpacing / 2 - rowOffset; x < width; x += dotSpacing) {
      const sampleX = Math.min(width - 1, Math.max(0, Math.floor(x)));
      const sampleY = Math.min(height - 1, Math.max(0, Math.floor(y)));
      const index = (sampleY * width + sampleX) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];

      const luma = red * 0.299 + green * 0.587 + blue * 0.114;
      const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
      const cleanWhite = luma >= whiteCutoff && saturation < 48;

      if (cleanWhite) continue;

      const boosted = clamp(adjustContrast(luma + exposureBoost, contrastAmount));
      const darkness = clamp(255 - boosted) / 255;
      const shapedDarkness = Math.pow(darkness, isMobileFilterCanvas ? 1.08 : 0.88);

      if (shapedDarkness < detailCutoff) continue;

      const radius = Math.max(minDotRadius, shapedDarkness * maxDotRadius);
      const dotX = isMobileFilterCanvas ? Math.round(x) + 0.5 : x;
      const dotY = isMobileFilterCanvas ? Math.round(y) + 0.5 : y;
      const alpha = Math.min(
        isMobileFilterCanvas ? 0.92 : 0.96,
        (isMobileFilterCanvas ? 0.2 : 0.2) +
          shapedDarkness * (isMobileFilterCanvas ? 0.82 : 0.9)
      );
      const shouldConnect = isMobileFilterCanvas ? false : shapedDarkness > 0.42;
      const shouldFillHeavyShadow = isMobileFilterCanvas ? false : shapedDarkness > 0.72;

      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(dotX, dotY, radius, 0, Math.PI * 2);
      context.fill();

      if (shouldConnect) {
        context.globalAlpha = Math.min(0.82, shapedDarkness * 0.78);
        context.lineWidth = Math.max(
          isMobileFilterCanvas ? 0.22 : 0.7,
          shapedDarkness * (isMobileFilterCanvas ? 0.46 : 1.65)
        );
        context.lineCap = 'round';
        context.strokeStyle = `rgb(${ink.red}, ${ink.green}, ${ink.blue})`;

        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + dotSpacing * 0.5, y + dotSpacing * 0.5);
        context.stroke();

        if (shapedDarkness > 0.56) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x - dotSpacing * 0.5, y + dotSpacing * 0.5);
          context.stroke();
        }
      }

      if (shouldFillHeavyShadow) {
        context.globalAlpha = Math.min(0.52, (shapedDarkness - 0.62) * 1.35);
        const shadowBlockSize = isMobileFilterCanvas ? 0.38 : 0.96;

        context.fillRect(
          x - dotSpacing * (shadowBlockSize / 2),
          y - dotSpacing * (shadowBlockSize / 2),
          dotSpacing * shadowBlockSize,
          dotSpacing * shadowBlockSize
        );
      }
    }
  }

  context.restore();

  context.save();
  context.globalAlpha = isMobileFilterCanvas ? 0.038 : 0.045;
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = `rgb(${ink.red}, ${ink.green}, ${ink.blue})`;
  context.fillRect(0, 0, width, height);
  context.restore();

  addVignette(
    context,
    width,
    height,
    isMobileFilterCanvas ? 'rgba(5,16,45,0.018)' : 'rgba(5,16,45,0.032)',
    0.96
  );
};

const applyGreenNightFilter = (context, width, height) => {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.2 + data[i + 1] * 0.7 + data[i + 2] * 0.1;
    const lifted = gray < 88 ? gray * 0.28 + 9 : 45 + (gray - 88) * 0.96;
    const contrast = adjustContrast(lifted, 1.4);
    const glow = Math.max(0, contrast - 34) * 1.05;

    data[i] = clamp(contrast * 0.025);
    data[i + 1] = clamp(32 + contrast * 0.86 + glow * 0.9);
    data[i + 2] = clamp(contrast * 0.065);
  }

  context.putImageData(imageData, 0, 0);

  context.save();

  context.globalAlpha = 0.12;
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = '#001207';
  context.fillRect(0, 0, width, height);

  addVignette(context, width, height, 'rgba(0,7,4,0.54)', 0.82);

  context.globalAlpha = 0.28;
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = '#001207';

  const scanlineGap = getIsMobileFilterCanvas(width, height) ? 2 : 3;
  const scanlineHeight = getIsMobileFilterCanvas(width, height) ? 0.5 : 1;

  for (let y = 0; y < height; y += scanlineGap) {
    context.fillRect(0, y, width, scanlineHeight);
  }

  context.globalAlpha = 0.24;
  context.globalCompositeOperation = 'screen';
  context.fillStyle = '#6DFF7E';
  context.fillRect(0, 0, width, height);

  context.restore();
};

const addDreamHighlightSparkles = (context, width, height) => {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const candidates = [];
  const isMobileFilterCanvas = getIsMobileFilterCanvas(width, height);
  const sampleStep = isMobileFilterCanvas ? 8 : 12;
  const edgePadding = isMobileFilterCanvas ? 8 : 12;

  for (let y = edgePadding; y < height - edgePadding; y += sampleStep) {
    for (let x = edgePadding; x < width - edgePadding; x += sampleStep) {
      const i = (y * width + x) * 4;
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const brightness = red * 0.299 + green * 0.587 + blue * 0.114;
      const softness = 255 - (Math.max(red, green, blue) - Math.min(red, green, blue));

      if (brightness > 145 && softness > 145) {
        candidates.push({ x, y, brightness });
      }
    }
  }

  context.save();
  context.globalCompositeOperation = 'screen';

  candidates
    .sort((a, b) => b.brightness - a.brightness)
    .slice(0, 120)
    .forEach((sparkle, index) => {
      const sizeMultiplier = isMobileFilterCanvas ? 0.48 : 1;
      const size = (11 + (sparkle.brightness - 145) * 0.18) * sizeMultiplier;
      const alpha = Math.min(0.78, 0.22 + (sparkle.brightness - 145) / 155);
      const rayLength = size * (index % 3 === 0 ? 1.22 : 0.78);

      const gradient = context.createRadialGradient(
        sparkle.x,
        sparkle.y,
        0,
        sparkle.x,
        sparkle.y,
        size
      );

      gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(0.2, `rgba(255,248,255,${alpha * 0.62})`);
      gradient.addColorStop(0.5, `rgba(245,220,250,${alpha * 0.34})`);
      gradient.addColorStop(0.8, `rgba(255,176,220,${alpha * 0.18})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      context.fillStyle = gradient;
      context.fillRect(sparkle.x - size, sparkle.y - size, size * 2, size * 2);

      context.globalAlpha = alpha;
      context.fillStyle = '#FFFFFF';
      context.fillRect(sparkle.x - rayLength / 2, sparkle.y - 1, rayLength, 2);
      context.fillRect(sparkle.x - 1, sparkle.y - rayLength / 2, 2, rayLength);

      context.globalAlpha = alpha * 0.62;
      context.save();
      context.translate(sparkle.x, sparkle.y);
      context.rotate(Math.PI / 4);
      context.fillStyle = '#FFE3F1';
      context.fillRect(-rayLength * 0.34, -0.8, rayLength * 0.68, 1.6);
      context.fillRect(-0.8, -rayLength * 0.34, 1.6, rayLength * 0.68);
      context.restore();

      context.globalAlpha = 1;
    });

  context.restore();
};

const applyThermalFilter = (context, width, height) => {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    const heat = clamp(adjustContrast(brightness * 255, 1.35)) / 255;

    let red;
    let green;
    let blue;

    if (heat < 0.18) {
      const t = heat / 0.18;
      red = mix(20, 37, t);
      green = mix(0, 28, t);
      blue = mix(92, 190, t);
    } else if (heat < 0.38) {
      const t = (heat - 0.18) / 0.2;
      red = mix(37, 42, t);
      green = mix(28, 184, t);
      blue = mix(190, 255, t);
    } else if (heat < 0.58) {
      const t = (heat - 0.38) / 0.2;
      red = mix(42, 255, t);
      green = mix(184, 236, t);
      blue = mix(255, 50, t);
    } else if (heat < 0.78) {
      const t = (heat - 0.58) / 0.2;
      red = mix(255, 255, t);
      green = mix(236, 82, t);
      blue = mix(50, 18, t);
    } else {
      const t = (heat - 0.78) / 0.22;
      red = mix(255, 255, t);
      green = mix(82, 246, t);
      blue = mix(18, 210, t);
    }

    data[i] = clamp(red);
    data[i + 1] = clamp(green);
    data[i + 2] = clamp(blue);
  }

  context.putImageData(imageData, 0, 0);

  context.save();

  context.globalAlpha = 0.13;
  context.globalCompositeOperation = 'screen';
  context.fillStyle = '#FFE16A';
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.1;
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = '#4B0B3D';
  context.fillRect(0, 0, width, height);

  addVignette(context, width, height, 'rgba(20,0,35,0.32)', 0.86);

  context.restore();
};

const applyColorFilter = (data, filterType, options = {}) => {
  for (let i = 0; i < data.length; i += 4) {
    let red = data[i];
    let green = data[i + 1];
    let blue = data[i + 2];

    if (filterType === 'classic') {
      red = adjustContrast(red * 1.05 + 8, 1.06);
      green = adjustContrast(green * 1.02 + 3, 1.04);
      blue = adjustContrast(blue * 0.94, 1.02);
    }

    if (filterType === 'blackWhite') {
      const shadowColor = getBlackWhiteShadowColor(options.blackWhiteShadowColor);
      const gray = red * 0.299 + green * 0.587 + blue * 0.114;
      const contrast = adjustContrast(gray - 7, 1.66);
      const shadow = 1 - clamp(contrast) / 255;
      const deepShadow = Math.pow(shadow, 1.16);
      const colorShadow = Math.pow(shadow, 2.85);
      const colorStrength = 0.22;

      red = contrast - deepShadow * 20 + colorShadow * shadowColor.red * colorStrength;
      green = contrast - deepShadow * 20 + colorShadow * shadowColor.green * colorStrength;
      blue = contrast - deepShadow * 24 + colorShadow * shadowColor.blue * colorStrength;
    }

    if (filterType === 'oldFilm') {
      const tint = hexToRgb(options.oldFilmColor || '#8B5A2B');
      const gray = red * 0.32 + green * 0.48 + blue * 0.2;
      const brightness = gray / 255;
      const tintStrength = 0.34 + (1 - brightness) * 0.16;

      red = adjustContrast(red * 0.48 + gray * 0.44 + tint.red * tintStrength, 1.08);
      green = adjustContrast(green * 0.42 + gray * 0.34 + tint.green * tintStrength, 0.96);
      blue = adjustContrast(blue * 0.24 + gray * 0.16 + tint.blue * tintStrength, 0.86);
    }

    if (filterType === 'dream') {
      const shadow = 1 - clamp((red * 0.299 + green * 0.587 + blue * 0.114) / 255);
      const pinkShadow = shadow * 0.2;

      red = mix(red, 255, 0.04) * 1.04 + 8 + pinkShadow * 28;
      green = mix(green, 230, 0.025) * 1.01 + 3 - pinkShadow * 10;
      blue = mix(blue, 255, 0.065) * 1.08 + 10 + pinkShadow * 18;
    }

    if (filterType === 'vintageBlue') {
      const gray = red * 0.28 + green * 0.4 + blue * 0.32;
      const contrast = adjustContrast(gray, 1.16);
      const normalized = clamp(contrast) / 255;

      red = mix(236, 16, 1 - normalized);
      green = mix(234, 32, 1 - normalized);
      blue = mix(228, 105, 1 - normalized);
    }

    if (filterType === 'sunsetFade') {
      const saturation = options.sunsetFade?.saturation || 1.52;
      const brightnessBoost = options.sunsetFade?.brightness || 1.05;
      const brightness = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
      const shadow = 1 - brightness;
      const highlight = brightness;
      const contrastRed = adjustContrast(red, 1.16);
      const contrastGreen = adjustContrast(green, 1.16);
      const contrastBlue = adjustContrast(blue, 1.18);

      red = contrastRed * saturation + Math.sin(highlight * Math.PI) * 38 + shadow * 18;
      green =
        contrastGreen * (saturation * 0.98) +
        Math.sin((highlight + 0.28) * Math.PI) * 34 -
        shadow * 4;
      blue =
        contrastBlue * (saturation * 1.08) +
        Math.sin((highlight + 0.58) * Math.PI) * 42 +
        highlight * 20;

      red *= brightnessBoost;
      green *= brightnessBoost;
      blue *= brightnessBoost;
    }

    data[i] = clamp(red);
    data[i + 1] = clamp(green);
    data[i + 2] = clamp(blue);
  }
};

const applyFilterOverlay = (context, width, height, filterType, options = {}) => {
  if (filterType === 'classic') {
    addSoftLightOverlay(context, width, height, '#FFE9A8', 0.08);

    if (options.classicFilter === 'vignette') {
      addMultiplyOverlay(context, width, height, NAVY, 0.06);
      addVignette(context, width, height, 'rgba(0,0,0,0.72)', 0.92);
      addVignette(context, width, height, 'rgba(5,16,45,0.52)', 1.08);
      addScreenOverlay(context, width, height, CREAM, 0.018);
    } else if (options.classicFilter === 'fishEye') {
      addFishEyeLensShade(context, width, height);
      addScreenOverlay(context, width, height, CREAM, 0.025);
    } else {
      addVignette(context, width, height, 'rgba(5,16,45,0.18)', 0.85);
    }
  }

  if (filterType === 'blackWhite') {
    context.save();

    const shadowColor = getBlackWhiteShadowColor(options.blackWhiteShadowColor);

    context.globalAlpha = 0.22;
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = '#060606';
    context.fillRect(0, 0, width, height);

    const edgeBurn = context.createRadialGradient(
      width * 0.5,
      height * 0.48,
      width * 0.22,
      width * 0.5,
      height * 0.5,
      width * 0.86
    );

    edgeBurn.addColorStop(0, 'rgba(255,255,255,0)');
    edgeBurn.addColorStop(0.64, 'rgba(255,255,255,0)');
    edgeBurn.addColorStop(0.82, shadowColor.edgeSoft);
    edgeBurn.addColorStop(1, shadowColor.edge);

    context.globalAlpha = 1;
    context.globalCompositeOperation = 'screen';
    context.fillStyle = edgeBurn;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 1;
    context.globalCompositeOperation = 'multiply';
    addVignette(context, width, height, 'rgba(0,0,0,0.62)', 0.82);
    addVignette(context, width, height, shadowColor.shadow, 0.9);

    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 0.28;

    for (let i = 0; i < 230; i += 1) {
      const speckSize = Math.random() * 1.85 + 0.4;
      const isLight = Math.random() > 0.58;

      context.fillStyle = isLight ? shadowColor.speck : 'rgba(0,0,0,0.68)';
      context.fillRect(Math.random() * width, Math.random() * height, speckSize, speckSize);
    }

    context.globalAlpha = 0.1;
    context.fillStyle = 'rgba(0,0,0,0.8)';

    for (let y = 0; y < height; y += 8) {
      context.fillRect(0, y, width, 1);
    }

    context.restore();
  }

  if (filterType === 'oldFilm') {
    context.save();

    const oldFilmColor = options.oldFilmColor || '#8B5A2B';

    addSoftLightOverlay(context, width, height, oldFilmColor, 0.22);
    addScreenOverlay(context, width, height, rgbToRgba(oldFilmColor, 1), 0.08);

    context.globalAlpha = 0.06;
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = rgbToRgba(oldFilmColor, 0.8);

    for (let y = 0; y < height; y += 5) {
      context.fillRect(0, y, width, 1);
    }

    context.globalAlpha = 0.12;
    context.fillStyle = rgbToRgba(oldFilmColor, 0.9);

    for (let i = 0; i < 80; i += 1) {
      const speckSize = Math.random() * 2.4 + 0.7;
      context.fillRect(Math.random() * width, Math.random() * height, speckSize, speckSize);
    }

    addVignette(context, width, height, rgbToRgba(oldFilmColor, 0.42), 0.78);
    context.restore();
  }

  if (filterType === 'dream') {
    addSoftLightOverlay(context, width, height, '#F9B8D0', 0.16);
    addMultiplyOverlay(context, width, height, '#8E255E', 0.055);
    addScreenOverlay(context, width, height, CREAM, 0.035);
    addScreenOverlay(context, width, height, '#DDE7FF', 0.045);
    addScreenOverlay(context, width, height, '#F9B8D0', 0.055);
    addVignette(context, width, height, 'rgba(126,27,87,0.2)', 0.84);
    addDreamHighlightSparkles(context, width, height);
  }

  if (filterType === 'vintageBlue') {
    addScreenOverlay(context, width, height, HALFTONE_CREAM, 0.05);

    const isMobileFilterCanvas = getIsMobileFilterCanvas(width, height);

    addBlueHalftone(context, width, height, {
      spacing: isMobileFilterCanvas ? 2.7 : 4.2,
      maxRadius: isMobileFilterCanvas ? 0.72 : 1.65,
      alpha: 0.72,
      blue: NEWJEANS_BLUE,
      thresholdBoost: -4,
    });

    addMultiplyOverlay(context, width, height, NEWJEANS_BLUE, 0.12);
    addScreenOverlay(context, width, height, HALFTONE_CREAM, 0.1);
  }

  if (filterType === 'sunsetFade') {
    const bloom = options.sunsetFade?.bloom || 0.72;
    const rainbow = context.createLinearGradient(0, 0, width, height);

    rainbow.addColorStop(0, 'rgba(255, 36, 146, 0.48)');
    rainbow.addColorStop(0.16, 'rgba(255, 111, 28, 0.42)');
    rainbow.addColorStop(0.32, 'rgba(255, 222, 54, 0.34)');
    rainbow.addColorStop(0.5, 'rgba(16, 214, 94, 0.36)');
    rainbow.addColorStop(0.7, 'rgba(18, 83, 255, 0.46)');
    rainbow.addColorStop(1, 'rgba(187, 120, 255, 0.48)');

    context.save();

    context.globalAlpha = 0.56;
    context.globalCompositeOperation = 'soft-light';
    context.fillStyle = rainbow;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.16;
    context.globalCompositeOperation = 'screen';
    context.fillStyle = rainbow;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.04;
    context.globalCompositeOperation = 'screen';
    context.filter = `blur(${4 * bloom}px) saturate(1.18) brightness(1.03)`;
    context.drawImage(context.canvas, 0, 0);
    context.filter = 'none';

    context.globalAlpha = 0.11;
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = '#25105A';
    context.fillRect(0, 0, width, height);

    addScreenOverlay(context, width, height, '#FF2492', 0.06);
    addScreenOverlay(context, width, height, '#FFDE36', 0.045);
    addScreenOverlay(context, width, height, '#1253FF', 0.065);
    addVignette(context, width, height, 'rgba(26, 9, 76, 0.12)', 0.86);

    context.restore();
  }
};

const applyCanvasFilter = (
  context,
  width,
  height,
  filterType,
  selectedClassicFilter = 'normal',
  selectedDitherColor = NAVY,
  selectedOldFilmColor = '#8B5A2B',
  filterEffectSettings = {}
) => {
  if (filterType === 'classic' && selectedClassicFilter === 'fishEye') {
    applyFishEyeWarp(context, width, height, 0.22);
  }

  if (filterType === 'dream') {
    context.save();

    context.globalAlpha = 0.22;
    context.globalCompositeOperation = 'screen';
    context.filter = 'blur(4px) brightness(1.18) saturate(1.1)';
    context.drawImage(context.canvas, 0, 0);

    context.globalAlpha = 0.11;
    context.filter = 'blur(10px) brightness(1.28) saturate(1.16)';
    context.drawImage(context.canvas, 0, 0);

    context.restore();
    context.filter = 'none';
    context.globalCompositeOperation = 'source-over';
  }

  if (filterType === 'pixel') {
    applyPixelArtGrid(context, width, height);
    addTexture(context, width, height, getIsMobileFilterCanvas(width, height) ? 0.28 : 0.45);
    return;
  }

  if (filterType === 'dither') {
    applyOrderedDither(context, width, height, selectedDitherColor, filterEffectSettings.dither);
    return;
  }

  if (filterType === 'greenNight') {
    const isMobileFilterCanvas = getIsMobileFilterCanvas(width, height);

    applyGreenNightFilter(context, width, height);
    addTexture(
      context,
      width,
      height,
      isMobileFilterCanvas ? 3.1 : 6.8,
      isMobileFilterCanvas ? 0.75 : 3.5
    );
    return;
  }

  if (filterType === 'thermal') {
    applyThermalFilter(context, width, height);
    addTexture(context, width, height, 0.6, 0.35);
    return;
  }

  const imageData = context.getImageData(0, 0, width, height);

  applyColorFilter(imageData.data, filterType, {
    oldFilmColor: selectedOldFilmColor,
    blackWhiteShadowColor: filterEffectSettings.blackWhiteShadowColor,
    sunsetFade: filterEffectSettings.sunsetFade,
  });

  context.putImageData(imageData, 0, 0);

  applyFilterOverlay(context, width, height, filterType, {
    classicFilter: selectedClassicFilter,
    oldFilmColor: selectedOldFilmColor,
    blackWhiteShadowColor: filterEffectSettings.blackWhiteShadowColor,
    sunsetFade: filterEffectSettings.sunsetFade,
  });

  const textureStrength = {
    classic: selectedClassicFilter === 'fishEye' ? 0.38 : 0.35,
    blackWhite: 1.8,
    oldFilm: 1.1,
    dream: 0.22,
    vintageBlue: 0.12,
    sunsetFade: 0.5,
  };

  addTexture(context, width, height, textureStrength[filterType] || 0.5);
};

const PhotoboothCameraPreview = forwardRef(function PhotoboothCameraPreview(
  {
    stream,
    icons,
    selectedFilter,
    selectedClassicFilter = 'normal',
    selectedDitherColor = NAVY,
    selectedOldFilmColor = '#8B5A2B',
    filterEffectSettings = {},
    filterBurstColors = [],
    isCameraOn,
    isCameraReady,
    isStartingCamera,
    cameraError,
    setIsCameraReady,
    setIsStartingCamera,
    setCameraError,
    isFilterBurstAnimating,
    filterBurstKey,
    filterBurstColor,
    isFlashing,
    isGettingReady,
    isCountingDown,
    currentShotNumber,
    selectedShotCount,
    countdown,
    onTryAgain,
    onOpenCamera,
  },
  ref
) {
  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const hasFilteredPreviewFrameRef = useRef(false);
  const isMountedRef = useRef(true);
  const latestPreviewSettingsRef = useRef({
    selectedFilter,
    selectedClassicFilter,
    selectedDitherColor,
    selectedOldFilmColor,
    filterEffectSettings,
  });
  const isMobilePreview = useMemo(() => getIsMobileDevice(), []);
  const [hasFilteredPreviewFrame, setHasFilteredPreviewFrame] = useState(false);

  useEffect(() => {
    latestPreviewSettingsRef.current = {
      selectedFilter,
      selectedClassicFilter,
      selectedDitherColor,
      selectedOldFilmColor,
      filterEffectSettings,
    };

    hasFilteredPreviewFrameRef.current = false;
    setHasFilteredPreviewFrame(false);
    lastFrameTimeRef.current = -getPreviewFrameInterval(selectedFilter, isMobilePreview);
  }, [
    selectedFilter,
    selectedClassicFilter,
    selectedDitherColor,
    selectedOldFilmColor,
    filterEffectSettings,
    isMobilePreview,
  ]);

  const waitForVideoMetadata = (video) => {
    return new Promise((resolve) => {
      if (video.videoWidth && video.videoHeight) {
        resolve(true);
        return;
      }

      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleLoadedMetadata);
        video.removeEventListener('playing', handleLoadedMetadata);
      };

      const handleLoadedMetadata = () => {
        cleanup();
        resolve(true);
      };

      timeoutId = window.setTimeout(() => {
        cleanup();
        resolve(false);
      }, 1800);

      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      video.addEventListener('canplay', handleLoadedMetadata, { once: true });
      video.addEventListener('playing', handleLoadedMetadata, { once: true });
    });
  };

  const drawMirroredFrame = (
    source,
    canvas,
    outputWidth = 900,
    outputHeight = 675,
    shouldReturnDataUrl = false
  ) => {
    if (!isVideoDrawable(source)) return null;

    const sourceWidth = source.videoWidth;
    const sourceHeight = source.videoHeight;

    if (canvas.width !== outputWidth) canvas.width = outputWidth;
    if (canvas.height !== outputHeight) canvas.height = outputHeight;

    canvas.style.backgroundColor = '#05102D';

    const context =
      canvas.getContext('2d', {
        alpha: true,
        willReadFrequently: true,
      }) || canvas.getContext('2d');

    if (!context) return null;

    const { offsetX, offsetY, drawWidth, drawHeight } = getCoverCrop(
      sourceWidth,
      sourceHeight,
      outputWidth,
      outputHeight,
      getIsMobileFilterCanvas(outputWidth, outputHeight) ? 1.18 : 1
    );

    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.clearRect(0, 0, outputWidth, outputHeight);

    context.save();
    context.translate(outputWidth, 0);
    context.scale(-1, 1);
    context.drawImage(
      source,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );
    context.restore();

    const activeSettings = latestPreviewSettingsRef.current;

    try {
      applyCanvasFilter(
        context,
        outputWidth,
        outputHeight,
        activeSettings.selectedFilter,
        activeSettings.selectedClassicFilter,
        activeSettings.selectedDitherColor,
        activeSettings.selectedOldFilmColor,
        activeSettings.filterEffectSettings
      );
    } catch (filterError) {
      console.error('Photo2y filter preview failed:', filterError);
    }

    return shouldReturnDataUrl ? canvas.toDataURL('image/png') : true;
  };

  useImperativeHandle(ref, () => ({
    captureFrame() {
      if (!videoRef.current || !captureCanvasRef.current) return null;
      return drawMirroredFrame(videoRef.current, captureCanvasRef.current, 900, 675, true);
    },
  }));

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    const setupVideo = async () => {
      if (!video) return;

      if (!stream) {
        video.pause();
        video.removeAttribute('src');
        video.srcObject = null;
        video.load();
        hasFilteredPreviewFrameRef.current = false;
        setHasFilteredPreviewFrame(false);
        setIsCameraReady(false);
        return;
      }

      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.disablePictureInPicture = true;

      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      try {
        await waitForVideoMetadata(video);

        try {
          const playPromise = video.play();

          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch {
          // Mobile browsers can report a play interruption even when the camera stream is usable.
        }

        if (!isMountedRef.current) return;

        setCameraError('');
        setIsCameraReady(true);
      } catch {
        if (!isMountedRef.current) return;

        setCameraError(
          'Camera preview failed. Tap Try again, or reopen this page in Safari/Chrome instead of an in-app browser.'
        );
        setIsCameraReady(false);
      }

      if (isMountedRef.current) {
        setIsStartingCamera(false);
      }
    };

    setupVideo();

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [stream, setCameraError, setIsCameraReady, setIsStartingCamera]);

  useEffect(() => {
    if (!isCameraOn || !isCameraReady || !videoRef.current || !previewCanvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastFrameTimeRef.current = 0;
      hasFilteredPreviewFrameRef.current = false;
      setHasFilteredPreviewFrame(false);
      return;
    }

    // const previewSize = getPreviewSize(isMobilePreview);
    let isPreviewLoopActive = true;

    const scheduleNextFrame = () => {
      if (!isPreviewLoopActive) return;

      animationRef.current = requestAnimationFrame(renderPreview);
    };

    const renderPreview = (timestamp = performance.now()) => {
      if (!isPreviewLoopActive) return;

      const video = videoRef.current;
      const canvas = previewCanvasRef.current;

      if (!video || !canvas || !isCameraOn || !isCameraReady) return;

      const activeFilter = latestPreviewSettingsRef.current.selectedFilter;
      const previewSize = getPreviewSize(isMobilePreview, activeFilter);
      const frameInterval = getPreviewFrameInterval(activeFilter, isMobilePreview);

      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        lastFrameTimeRef.current = timestamp;

        try {
          const didDrawFrame = drawMirroredFrame(
            video,
            canvas,
            previewSize.width,
            previewSize.height,
            false
          );

          if (didDrawFrame && isMountedRef.current && !hasFilteredPreviewFrameRef.current) {
            hasFilteredPreviewFrameRef.current = true;
            setHasFilteredPreviewFrame(true);
          }
        } catch {
          if (isMountedRef.current && !hasFilteredPreviewFrameRef.current) {
            setHasFilteredPreviewFrame(false);
          }
        }
      }

      scheduleNextFrame();
    };

    const startPreviewLoop = () => {
      const video = videoRef.current;

      if (!isVideoDrawable(video)) {
        if (video && stream && video.srcObject !== stream) {
          video.srcObject = stream;
        }

        if (video && video.paused && stream) {
          video.play().catch(() => {});
        }

        animationRef.current = requestAnimationFrame(startPreviewLoop);
        return;
      }

      renderPreview(performance.now());
    };

    startPreviewLoop();

    return () => {
      isPreviewLoopActive = false;

      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      animationRef.current = null;
      lastFrameTimeRef.current = 0;
    };
  }, [isCameraOn, isCameraReady, isMobilePreview, stream]);

  return (
    <div className="relative flex aspect-[16/9] max-h-[72vh] w-full items-center justify-center overflow-hidden rounded-[34px] border-2 border-[#05102D] bg-[#05102D] [transform:translateZ(0)]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        webkit-playsinline="true"
        className={`pointer-events-none absolute inset-0 z-[1] h-full w-full scale-x-[-1] object-cover ${
          isCameraOn ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <canvas
        ref={previewCanvasRef}
        className={`pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover transition-opacity duration-75 ${
          isCameraOn && isCameraReady && hasFilteredPreviewFrame ? 'opacity-100' : 'opacity-0'
        } [image-rendering:auto] [transform:translateZ(0)]`}
      />

      <canvas ref={captureCanvasRef} className="hidden" />

      {selectedClassicFilter !== 'fishEye' && (
        <div className="pointer-events-none absolute inset-0 z-[8] bg-[radial-gradient(circle,transparent_55%,rgba(5,16,45,0.38)_100%)]" />
      )}

      <div className="pointer-events-none absolute inset-0 z-[9] bg-[linear-gradient(rgba(253,249,242,.35)_1px,transparent_1px)] bg-[length:100%_4px] opacity-[0.12]" />

      {isFilterBurstAnimating && (
        <div
          key={filterBurstKey}
          className="pointer-events-none absolute inset-0 z-[75] hidden overflow-hidden md:block"
        >
          <div
            className="absolute -left-[18%] -top-[25%] h-[52vw] min-h-[430px] w-[52vw] min-w-[430px] rounded-full animate-filter-circle-cover"
            style={{
              background:
                filterBurstColors.length > 1
                  ? `linear-gradient(135deg, ${filterBurstColors.join(', ')})`
                  : filterBurstColor,
              filter: filterBurstColors.length > 1 ? 'blur(10px) saturate(1.8)' : 'none',
            }}
          />
        </div>
      )}

      {isFlashing && (
        <div className="pointer-events-none absolute inset-0 z-[90] overflow-hidden">
          <div className="absolute left-1/2 top-1/2 hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FDF9F2] animate-photo-flash-core md:block" />
          <div className="absolute left-1/2 top-1/2 hidden h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE16A]/90 animate-photo-flash-ring md:block" />
          <div className="absolute left-1/2 top-1/2 hidden h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F9B8D0]/70 animate-photo-flash-pop md:block" />
          <div className="absolute left-1/2 top-1/2 hidden h-[170%] w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#FDF9F2]/90 animate-photo-flash-streak-one md:block" />
          <div className="absolute left-1/2 top-1/2 hidden h-[170%] w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#FDF9F2]/90 animate-photo-flash-streak-two md:block" />
          <div className="absolute inset-0 bg-[#FDF9F2] animate-photo-flash-screen" />
        </div>
      )}

      {cameraError && !isStartingCamera && (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-[#05102D]/86 px-6 text-center text-[#FDF9F2]">
          <p className="mb-2 text-xl font-black">Camera unavailable</p>
          <p className="mb-5 text-sm opacity-85">{cameraError}</p>

          <button
            type="button"
            onClick={onTryAgain}
            className="rounded-2xl border-2 border-[#05102D] bg-[#1D56CF] px-5 py-2 font-black text-[#FDF9F2] transition-all duration-200 ease-out md:hover:-translate-y-1 md:hover:rotate-[-1deg] md:hover:bg-[#1746A8] md:hover:shadow-[3px_4px_0_#05102D] active:translate-y-1 active:shadow-none"
          >
            Try again
          </button>
        </div>
      )}

      {!cameraError && !isCameraOn && !isStartingCamera && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#FDF9F2]">
          <img
            src={icons.cameraOff}
            alt="Camera off"
            className="mb-5 h-14 w-14 object-contain md:animate-cartoon-bob"
          />

          <p className="mb-5 text-xl font-black">Your camera is off</p>

          <button
            type="button"
            onClick={onOpenCamera}
            className="rounded-2xl border-2 border-[#05102D] bg-[#1D56CF] px-5 py-2 font-black text-[#FDF9F2] transition-all duration-200 ease-out md:hover:-translate-y-1 md:hover:rotate-[1deg] md:hover:bg-[#1746A8] md:hover:shadow-[3px_4px_0_#05102D] active:translate-y-1 active:shadow-none"
          >
            Open camera
          </button>
        </div>
      )}

      {isStartingCamera && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#05102D] text-[#FDF9F2]">
          <p className="text-lg font-black md:animate-cartoon-bob">Opening camera...</p>
        </div>
      )}

      {isCameraOn && !isCameraReady && !isStartingCamera && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#05102D] text-[#FDF9F2]">
          <p className="text-lg font-black md:animate-cartoon-bob">Starting camera...</p>
        </div>
      )}

      {(isGettingReady || isCountingDown) && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-[#FDF9F2] drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
            <span className="mb-2 text-sm font-black uppercase tracking-[0.25em] md:text-base">
              Shot {currentShotNumber}/{selectedShotCount}
            </span>

            {isGettingReady ? (
              <span className="font-serif text-4xl font-black uppercase leading-none md:animate-cartoon-count md:text-6xl">
                Get Ready
              </span>
            ) : (
              <span className="font-serif text-8xl font-black leading-none md:animate-cartoon-count md:text-9xl">
                {countdown}
              </span>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes filterCircleCover {
          0% {
            opacity: 0;
            transform: scale(0);
            filter: blur(0px);
          }

          12% {
            opacity: 1;
            transform: scale(0.9);
            filter: blur(0px);
          }

          45% {
            opacity: 1;
            transform: scale(4.7);
            filter: blur(1px);
          }

          78% {
            opacity: 0.86;
            transform: scale(6.7);
            filter: blur(2px);
          }

          100% {
            opacity: 0;
            transform: scale(8.4);
            filter: blur(6px);
          }
        }

        @keyframes photoFlashCore {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }

          12% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }

          38% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(4.8);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(8);
          }
        }

        @keyframes photoFlashRing {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }

          18% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1.8);
          }

          68% {
            opacity: 0.45;
            transform: translate(-50%, -50%) scale(6.5);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(9);
          }
        }

        @keyframes photoFlashPop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }

          20% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.7);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(7.5);
          }
        }

        @keyframes photoFlashStreakOne {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(45deg) scaleY(0.02) scaleX(0.3);
          }

          14% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(45deg) scaleY(1) scaleX(1);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(45deg) scaleY(1.35) scaleX(1.15);
          }
        }

        @keyframes photoFlashStreakTwo {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(-45deg) scaleY(0.02) scaleX(0.3);
          }

          14% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(-45deg) scaleY(1) scaleX(1);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(-45deg) scaleY(1.35) scaleX(1.15);
          }
        }

        @keyframes photoFlashScreen {
          0% { opacity: 0; }
          18% { opacity: 0; }
          30% { opacity: 0.94; }
          48% { opacity: 0.42; }
          100% { opacity: 0; }
        }

        .animate-filter-circle-cover {
          animation: filterCircleCover 1050ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center;
          will-change: transform, opacity, filter;
        }

        .animate-photo-flash-core {
          animation: photoFlashCore 860ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-photo-flash-ring {
          animation: photoFlashRing 860ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-photo-flash-pop {
          animation: photoFlashPop 860ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-photo-flash-streak-one {
          animation: photoFlashStreakOne 860ms ease-out forwards;
        }

        .animate-photo-flash-streak-two {
          animation: photoFlashStreakTwo 860ms ease-out forwards;
        }

        .animate-photo-flash-screen {
          animation: photoFlashScreen 860ms ease-out forwards;
        }

        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .animate-filter-circle-cover,
          .animate-photo-flash-core,
          .animate-photo-flash-ring,
          .animate-photo-flash-pop,
          .animate-photo-flash-streak-one,
          .animate-photo-flash-streak-two {
            animation: none !important;
          }

          .animate-photo-flash-screen {
            animation-duration: 340ms;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-filter-circle-cover,
          .animate-photo-flash-core,
          .animate-photo-flash-ring,
          .animate-photo-flash-pop,
          .animate-photo-flash-streak-one,
          .animate-photo-flash-streak-two,
          .animate-photo-flash-screen {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});

export default PhotoboothCameraPreview;