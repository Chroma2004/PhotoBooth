import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

const CREAM = '#FDF9F2';
const NAVY = '#05102D';
const NEWJEANS_BLUE = '#1B2F73';
const HALFTONE_CREAM = '#F4F0E8';

const clamp = (value) => Math.max(0, Math.min(255, value));

const getCoverCrop = (sourceWidth, sourceHeight, outputWidth, outputHeight) => {
  const sourceRatio = sourceWidth / sourceHeight;
  const outputRatio = outputWidth / outputHeight;

  if (sourceRatio > outputRatio) {
    const drawWidth = sourceHeight * outputRatio;

    return {
      offsetX: (sourceWidth - drawWidth) / 2,
      offsetY: 0,
      drawWidth,
      drawHeight: sourceHeight,
    };
  }

  const drawHeight = sourceWidth / outputRatio;

  return {
    offsetX: 0,
    offsetY: (sourceHeight - drawHeight) / 2,
    drawWidth: sourceWidth,
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

const getPreviewSize = (isMobilePreview = false) => {
  if (isMobilePreview) {
    return {
      width: 480,
      height: 360,
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
  return expensiveFilters.has(filterType) ? 1000 / 12 : 1000 / 18;
};

/*
  Keep all your existing filter helper functions here unchanged:
  addFineGrain
  addVisibleGrainDots
  addSoftChromaticShift
  addTexture
  posterizeValue
  addVignette
  applyFishEyeWarp
  addFishEyeLensShade
  addSoftLightOverlay
  addScreenOverlay
  addMultiplyOverlay
  addBlueHalftone
  applyPixelArtGrid
  applyOrderedDither
  applyGreenNightFilter
  addDreamHighlightSparkles
  applyThermalFilter
  applyColorFilter
  applyFilterOverlay
  applyCanvasFilter

  Do not delete them. Only replace the component section below if you want the fastest update.
*/

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
  const isMountedRef = useRef(true);
  const isMobilePreview = useMemo(() => getIsMobileDevice(), []);
  const [hasFilteredPreviewFrame, setHasFilteredPreviewFrame] = useState(false);

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
    const sourceWidth = source.videoWidth;
    const sourceHeight = source.videoHeight;

    if (!sourceWidth || !sourceHeight) return null;

    if (canvas.width !== outputWidth) canvas.width = outputWidth;
    if (canvas.height !== outputHeight) canvas.height = outputHeight;

    const context = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: true,
    });

    if (!context) return null;

    const { offsetX, offsetY, drawWidth, drawHeight } = getCoverCrop(
      sourceWidth,
      sourceHeight,
      outputWidth,
      outputHeight
    );

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

    applyCanvasFilter(
      context,
      outputWidth,
      outputHeight,
      selectedFilter,
      selectedClassicFilter,
      selectedDitherColor,
      selectedOldFilmColor,
      filterEffectSettings
    );

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

      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      try {
        await waitForVideoMetadata(video);

        const playPromise = video.play();

        if (playPromise !== undefined) {
          await playPromise;
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
      return;
    }

    const previewSize = getPreviewSize(isMobilePreview);
    const frameInterval = getPreviewFrameInterval(selectedFilter, isMobilePreview);
    setHasFilteredPreviewFrame(false);

    const renderPreview = (timestamp = 0) => {
      if (!videoRef.current || !previewCanvasRef.current || !isCameraOn || !isCameraReady) return;

      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        lastFrameTimeRef.current = timestamp;

        try {
          const didDrawFrame = drawMirroredFrame(
            videoRef.current,
            previewCanvasRef.current,
            previewSize.width,
            previewSize.height,
            false
          );

          if (didDrawFrame && isMountedRef.current) {
            setHasFilteredPreviewFrame(true);
            setCameraError('');
            setIsCameraReady(true);
          }
        } catch {
          if (isMountedRef.current) {
            setHasFilteredPreviewFrame(false);
          }
        }
      }

      animationRef.current = requestAnimationFrame(renderPreview);
    };

    animationRef.current = requestAnimationFrame(renderPreview);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastFrameTimeRef.current = 0;
    };
  }, [
    isCameraOn,
    isCameraReady,
    isMobilePreview,
    selectedFilter,
    selectedClassicFilter,
    selectedDitherColor,
    selectedOldFilmColor,
    filterEffectSettings,
    setCameraError,
    setIsCameraReady,
  ]);

  return (
    <div className="relative flex aspect-[16/9] max-h-[72vh] w-full items-center justify-center overflow-hidden rounded-[34px] border-2 border-[#05102D] bg-[#05102D]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        webkit-playsinline="true"
        className={`pointer-events-none absolute inset-0 h-full w-full scale-x-[-1] object-cover ${
          isCameraOn && !hasFilteredPreviewFrame ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <canvas
        ref={previewCanvasRef}
        className={`relative z-[1] h-full w-full object-cover ${
          isCameraOn && isCameraReady && hasFilteredPreviewFrame ? 'block' : 'hidden'
        }`}
      />

      <canvas ref={captureCanvasRef} className="hidden" />

      {selectedClassicFilter !== 'fishEye' && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(5,16,45,0.38)_100%)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(253,249,242,.35)_1px,transparent_1px)] bg-[length:100%_4px] opacity-[0.12]" />

      {isFilterBurstAnimating && (
        <div
          key={filterBurstKey}
          className="pointer-events-none absolute inset-0 z-[75] overflow-hidden md:block"
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
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FDF9F2] animate-photo-flash-core" />
          <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE16A]/90 animate-photo-flash-ring" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F9B8D0]/70 animate-photo-flash-pop" />
          <div className="absolute left-1/2 top-1/2 h-[170%] w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#FDF9F2]/90 animate-photo-flash-streak-one" />
          <div className="absolute left-1/2 top-1/2 h-[170%] w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#FDF9F2]/90 animate-photo-flash-streak-two" />
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
          0% { opacity: 0; transform: scale(0); filter: blur(0px); }
          12% { opacity: 1; transform: scale(0.9); filter: blur(0px); }
          45% { opacity: 1; transform: scale(4.7); filter: blur(1px); }
          78% { opacity: 0.86; transform: scale(6.7); filter: blur(2px); }
          100% { opacity: 0; transform: scale(8.4); filter: blur(6px); }
        }

        @keyframes photoFlashCore {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          12% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          38% { opacity: 1; transform: translate(-50%, -50%) scale(4.8); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(8); }
        }

        @keyframes photoFlashRing {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          18% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.8); }
          68% { opacity: 0.45; transform: translate(-50%, -50%) scale(6.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(9); }
        }

        @keyframes photoFlashPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          20% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.7); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(7.5); }
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