import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Header from './Components/Header.jsx';
import Footer from './Components/Footer.jsx';
import Photos from './Components/Photos.jsx';
import PhotoboothFilter, { filterOptions } from './Components/PhotoboothFilter.jsx';
import PhotoboothStripDesign, {
  MiniStripPreview,
  getContrastColor,
} from './Components/PhotoboothStripDesign.jsx';
import PhotoboothNumberOfPhotos from './Components/PhotoboothNumberOfPhotos.jsx';
import PhotoboothCameraPreview from './Components/PhotoboothCameraPreview.jsx';
import PrintAnimation from './Components/PrintAnimation.jsx';

import cameraIcon from './assets/Camera.png';
import cameraOffIcon from './assets/CamOff.svg';
import stripDesignIcon from './assets/StripDesign.png';
import pictureShineIcon from './assets/PictureShine.png';
import filterIcon from './assets/Filter.png';
import vignetteIcon from './assets/Vignette.png';
import fishEyeIcon from './assets/FishEye.png';

const BLUE = '#1D56CF';
const CREAM = '#FDF9F2';
const NAVY = '#05102D';

const API_URL = 'http://localhost:3001/api';

const STORAGE_KEYS = {
  cameraPreference: 'photo2y-camera-preference',
};

const icons = {
  cameraOn: cameraIcon,
  cameraOff: cameraOffIcon,
  photoStrip: stripDesignIcon,
  photoStripWhite: stripDesignIcon,
  stripDesign: pictureShineIcon,
  stripDesignWhite: pictureShineIcon,
  filter: filterIcon,
  filterWhite: filterIcon,
};

const photoboothTools = [
  {
    id: 'photoStrip',
    title: 'Number of photos',
    iconBlue: icons.photoStrip,
    iconWhite: icons.photoStripWhite,
    rotate: 'md:hover:rotate-[-3deg]',
  },
  {
    id: 'stripDesign',
    title: 'Strip design',
    iconBlue: icons.stripDesign,
    iconWhite: icons.stripDesignWhite,
    rotate: 'md:hover:rotate-[3deg]',
  },
  {
    id: 'filter',
    title: 'Filter',
    iconBlue: icons.filter,
    iconWhite: icons.filterWhite,
    rotate: 'md:hover:rotate-[-3deg]',
  },
];

const ditherColorOptions = ['#05102D', '#D72638', '#2FBF71', '#1D56CF', '#8B5CF6'];

const blackWhiteShadowColorOptions = [
  { value: 'yellow', label: 'Yellow', color: '#FFC423' },
  { value: 'green', label: 'Green', color: '#46EB7A' },
  { value: 'blue', label: 'Blue', color: '#3280FF' },
];

const classicFilterOptions = [
  {
    id: 'normal',
    label: 'Normal',
    icon: cameraIcon,
  },
  {
    id: 'vignette',
    label: 'Dark Vignette',
    icon: vignetteIcon,
  },
  {
    id: 'fishEye',
    label: 'Soft Fisheye',
    icon: fishEyeIcon,
  },
];

const oldFilmColorOptions = [
  { value: '#8B5A2B', label: 'Sepia' },
  { value: '#A16207', label: 'Amber' },
  { value: '#92400E', label: 'Brown' },
  { value: '#7C2D12', label: 'Rust' },
  { value: '#57534E', label: 'Warm Gray' },
  { value: '#3F3F46', label: 'Charcoal' },
  { value: '#D72638', label: 'Red' },
  { value: '#22C55E', label: 'Green' },
  { value: '#1D56CF', label: 'Blue' },
];

const filterEffectSettings = {
  dither: {
    dotSize: 2,
    gap: 3,
  },
  sunsetFade: {
    bloom: 1.85,
    saturation: 1.65,
    brightness: 1.12,
    rainbowColors: ['#FF4FA3', '#FF8A3D', '#FFE16A', '#22C55E', '#1D56CF', '#CBB7FF'],
  },
};

const getFilterBurstColor = (filterId) => {
  if (filterId === 'sunsetFade') return '#FF4FA3';

  const selectedOption = filterOptions.find((filter) => filter.id === filterId);
  return selectedOption?.color || BLUE;
};

const createSafeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `photo2y-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isTouchCameraDevice = () => {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 768px)').matches;
};

const getSavedCameraPreference = () => {
  if (isTouchCameraDevice()) return false;

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.cameraPreference);
    return saved === null ? true : saved === 'on';
  } catch {
    return true;
  }
};

const fetchSavedPhotos = async () => {
  const [photosResponse, archivedPhotosResponse] = await Promise.all([
    fetch(`${API_URL}/photos`),
    fetch(`${API_URL}/photos/archive`),
  ]);

  if (!photosResponse.ok || !archivedPhotosResponse.ok) {
    throw new Error('Failed to load saved photos.');
  }

  const savedPhotos = await photosResponse.json();
  const savedArchivedPhotos = await archivedPhotosResponse.json();

  return {
    savedPhotos: Array.isArray(savedPhotos) ? savedPhotos : [],
    savedArchivedPhotos: Array.isArray(savedArchivedPhotos) ? savedArchivedPhotos : [],
  };
};

const savePhotoToDatabase = async (photo) => {
  const response = await fetch(`${API_URL}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(photo),
  });

  if (!response.ok) {
    throw new Error('Failed to save photo.');
  }

  const result = await response.json();
  return result.photo || photo;
};

const archivePhotoInDatabase = async (id) => {
  const response = await fetch(`${API_URL}/photos/${id}/archive`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to archive photo.');
  }
};

const restorePhotoInDatabase = async (id) => {
  const response = await fetch(`${API_URL}/photos/${id}/restore`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to restore photo.');
  }
};

const renamePhotoInDatabase = async (id, label) => {
  const response = await fetch(`${API_URL}/photos/${id}/rename`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ label }),
  });

  if (!response.ok) {
    throw new Error('Failed to rename photo.');
  }
};

const savePhotoStickersToDatabase = async (id, stickers = []) => {
  const response = await fetch(`${API_URL}/photos/${id}/stickers`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stickers }),
  });

  if (!response.ok) {
    throw new Error('Failed to save photo stickers.');
  }

  const result = await response.json();
  return result.stickers || stickers;
};

const deletePhotoFromDatabase = async (id) => {
  const response = await fetch(`${API_URL}/photos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete photo.');
  }
};

const getBackgroundImageUrl = (image = '') => {
  if (!image || typeof image !== 'string') return '';

  if (image.startsWith('url(')) {
    return image.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
  }

  return image;
};

const getFrames = (photo) => {
  if (Array.isArray(photo?.frames) && photo.frames.length) return photo.frames.filter(Boolean);
  if (photo?.src) return [photo.src];
  return [];
};

const getPhotoStripTheme = (photo) => {
  const stripColor =
    photo?.stripColor ||
    photo?.selectedStripColor ||
    photo?.design?.stripColor ||
    photo?.design?.selectedStripColor ||
    photo?.stripDesign?.stripColor ||
    photo?.stripDesign?.selectedStripColor ||
    CREAM;

  const stripImage =
    photo?.stripImage ||
    photo?.selectedStripImage ||
    photo?.design?.stripImage ||
    photo?.design?.selectedStripImage ||
    photo?.stripDesign?.stripImage ||
    photo?.stripDesign?.selectedStripImage ||
    '';

  return {
    stripColor,
    stripImage,
    contrastColor: stripImage ? CREAM : getContrastColor(stripColor),
  };
};

const getPhotoDate = (photo) => {
  const rawDate =
    photo?.takenAt ||
    photo?.createdAt ||
    photo?.timestamp ||
    photo?.dateTaken ||
    photo?.date ||
    photo?.time;

  const parsedDate = rawDate ? new Date(rawDate) : new Date();

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const sanitizeFileName = (name = 'photo-strip') =>
  name
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'photo-strip';

function App() {
  const cameraPreviewRef = useRef(null);
  const stripCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const isStartingCameraRef = useRef(false);
  const filterChangeTimeoutRef = useRef(null);

  const timersRef = useRef({
    countdown: null,
    print: null,
    ready: null,
    next: null,
    flash: null,
    cameraToggle: null,
    floatingTool: null,
    filterBurst: null,
    mobileCameraAction: null,
    classicFilterTap: null,
    colorOptionTap: null,
  });

  const [currentPage, setCurrentPage] = useState('camera');
  const [photos, setPhotos] = useState([]);
  const [archivedPhotos, setArchivedPhotos] = useState([]);
  const [isLoadingSavedPhotos, setIsLoadingSavedPhotos] = useState(true);

  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCameraToggleAnimating, setIsCameraToggleAnimating] = useState(false);
  const [mobileCameraAction, setMobileCameraAction] = useState(null);
  const [isCameraPreferredOn, setIsCameraPreferredOn] = useState(getSavedCameraPreference);

  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isGettingReady, setIsGettingReady] = useState(false);

  const [boothShots, setBoothShots] = useState([]);
  const [currentShotNumber, setCurrentShotNumber] = useState(0);
  const [isBoothSessionActive, setIsBoothSessionActive] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [pendingPhotoStrip, setPendingPhotoStrip] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const [activePanel, setActivePanel] = useState(null);
  const [animatedToolId, setAnimatedToolId] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const [selectedShotCount, setSelectedShotCount] = useState(4);
  const [selectedStripColor, setSelectedStripColor] = useState(CREAM);
  const [selectedStripImage, setSelectedStripImage] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('classic');
  const [selectedClassicFilter, setSelectedClassicFilter] = useState('normal');
  const [selectedDitherColor, setSelectedDitherColor] = useState(NAVY);
  const [selectedOldFilmColor, setSelectedOldFilmColor] = useState('#8B5A2B');
  const [selectedBlackWhiteShadowColor, setSelectedBlackWhiteShadowColor] = useState('yellow');
  const [filterPreviewVersion, setFilterPreviewVersion] = useState(0);

  const [animatedClassicFilterId, setAnimatedClassicFilterId] = useState(null);
  const [animatedColorOption, setAnimatedColorOption] = useState(null);

  const [isFilterBurstAnimating, setIsFilterBurstAnimating] = useState(false);
  const [filterBurstKey, setFilterBurstKey] = useState(0);
  const [filterBurstColor, setFilterBurstColor] = useState(getFilterBurstColor('classic'));

  const shouldReduceHoverPreview = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 767px)').matches;
  }, []);

  const isMobilePerformanceMode = shouldReduceHoverPreview;

  const isBusy =
    isCountingDown || isGettingReady || isBoothSessionActive || isPrinting || isPrintReady;

  const isToolDisabled = isBoothSessionActive || isPrinting || isPrintReady;

  const activeFilterEffectSettings = useMemo(
    () => ({
      ...filterEffectSettings,
      blackWhiteShadowColor: selectedBlackWhiteShadowColor,
      previewVersion: filterPreviewVersion,
    }),
    [filterPreviewVersion, selectedBlackWhiteShadowColor]
  );

  const clearTimer = useCallback((key) => {
    const timer = timersRef.current[key];

    if (!timer) return;

    clearTimeout(timer);
    clearInterval(timer);
    timersRef.current[key] = null;
  }, []);

  const clearAllTimers = useCallback(() => {
    Object.keys(timersRef.current).forEach(clearTimer);

    if (filterChangeTimeoutRef.current) {
      clearTimeout(filterChangeTimeoutRef.current);
      filterChangeTimeoutRef.current = null;
    }
  }, [clearTimer]);

  const clearCountdown = useCallback(() => {
    ['countdown', 'ready', 'next'].forEach(clearTimer);
    setCountdown(null);
    setIsCountingDown(false);
    setIsGettingReady(false);
  }, [clearTimer]);

  const resetBoothState = useCallback(() => {
    setBoothShots([]);
    setCurrentShotNumber(0);
    setIsBoothSessionActive(false);
    setIsPrinting(false);
    setIsPrintReady(false);
  }, []);

  const saveCameraPreference = useCallback((value) => {
    try {
      localStorage.setItem(STORAGE_KEYS.cameraPreference, value ? 'on' : 'off');
    } catch {
      // Ignore storage errors.
    }

    setIsCameraPreferredOn(value);
  }, []);

  const triggerTimedAnimation = useCallback(
    (key, setter, duration) => {
      if (isMobilePerformanceMode && key !== 'cameraToggle') {
        setter(false);
        return;
      }

      clearTimer(key);
      setter(true);

      timersRef.current[key] = setTimeout(() => {
        setter(false);
        timersRef.current[key] = null;
      }, duration);
    },
    [clearTimer, isMobilePerformanceMode]
  );

  const triggerFloatingToolAnimation = useCallback(
    (toolId) => {
      if (isMobilePerformanceMode) return;

      clearTimer('floatingTool');
      setAnimatedToolId(toolId);

      timersRef.current.floatingTool = setTimeout(() => {
        setAnimatedToolId(null);
        timersRef.current.floatingTool = null;
      }, 720);
    },
    [clearTimer, isMobilePerformanceMode]
  );

  const triggerMobileCameraAction = useCallback(
    (action) => {
      clearTimer('mobileCameraAction');
      setMobileCameraAction(action);

      timersRef.current.mobileCameraAction = setTimeout(() => {
        setMobileCameraAction(null);
        timersRef.current.mobileCameraAction = null;
      }, isMobilePerformanceMode ? 280 : 620);
    },
    [clearTimer, isMobilePerformanceMode]
  );

  const triggerFilterBurstAnimation = useCallback(() => {
    if (isMobilePerformanceMode) {
      setIsFilterBurstAnimating(false);
      return;
    }

    clearTimer('filterBurst');
    setIsFilterBurstAnimating(false);

    requestAnimationFrame(() => {
      setFilterBurstKey((currentValue) => currentValue + 1);
      setIsFilterBurstAnimating(true);
    });

    timersRef.current.filterBurst = setTimeout(() => {
      setIsFilterBurstAnimating(false);
      timersRef.current.filterBurst = null;
    }, 720);
  }, [clearTimer, isMobilePerformanceMode]);

  const triggerOptionTapAnimation = useCallback(
    (timerKey, setter, value, duration = 520) => {
      if (isMobilePerformanceMode) {
        setter(null);
        return;
      }

      clearTimer(timerKey);
      setter(value);

      timersRef.current[timerKey] = setTimeout(() => {
        setter(null);
        timersRef.current[timerKey] = null;
      }, duration);
    },
    [clearTimer, isMobilePerformanceMode]
  );

  const triggerPhotoFlash = useCallback(() => {
    clearTimer('flash');
    setIsFlashing(false);

    requestAnimationFrame(() => {
      setIsFlashing(true);
    });

    timersRef.current.flash = setTimeout(
      () => {
        setIsFlashing(false);
        timersRef.current.flash = null;
      },
      isMobilePerformanceMode ? 340 : 620
    );
  }, [clearTimer, isMobilePerformanceMode]);

  useEffect(() => {
    let isMounted = true;

    const loadPersistedPhotos = async () => {
      setIsLoadingSavedPhotos(true);

      try {
        const { savedPhotos, savedArchivedPhotos } = await fetchSavedPhotos();

        if (!isMounted) return;

        setPhotos(savedPhotos);
        setArchivedPhotos(savedArchivedPhotos);
      } catch (error) {
        console.error('Failed to load saved photos from database:', error);
      } finally {
        if (isMounted) {
          setIsLoadingSavedPhotos(false);
        }
      }
    };

    loadPersistedPhotos();

    return () => {
      isMounted = false;
    };
  }, []);

  const stopCamera = useCallback(
    (resetPreference = false) => {
      clearCountdown();
      clearTimer('print');
      clearTimer('flash');
      clearTimer('filterBurst');

      if (resetPreference) saveCameraPreference(false);

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      isStartingCameraRef.current = false;

      setCameraStream(null);
      setIsCameraReady(false);
      setIsCameraOn(false);
      setIsStartingCamera(false);
      setIsFlashing(false);
      setIsFilterBurstAnimating(false);
      setMobileCameraAction(null);
      resetBoothState();
    },
    [clearCountdown, clearTimer, resetBoothState, saveCameraPreference]
  );

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current || isStartingCameraRef.current) return;

      isStartingCameraRef.current = true;

      setCameraError('');
      setIsCameraReady(false);
      setIsStartingCamera(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Your browser does not support camera access.');
        setIsStartingCamera(false);
        isStartingCameraRef.current = false;
        return;
      }

      const isLocalhost =
        typeof window !== 'undefined' &&
        ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

      const isSecureCameraContext =
        typeof window === 'undefined' || window.isSecureContext || isLocalhost;

      if (!isSecureCameraContext) {
        setCameraError('Camera access needs HTTPS on phones. Please open the secure https:// link.');
        setIsStartingCamera(false);
        isStartingCameraRef.current = false;
        return;
      }

      const isMobileCamera = isTouchCameraDevice();

      const cameraConstraints = [
        {
          video: isMobileCamera
            ? {
                facingMode: { ideal: 'user' },
                width: { ideal: 480 },
                height: { ideal: 640 },
                frameRate: { ideal: 15, max: 20 },
              }
            : {
                facingMode: { ideal: 'user' },
                width: { ideal: 1280 },
                height: { ideal: 960 },
                frameRate: { ideal: 30, max: 30 },
              },
          audio: false,
        },
        {
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 480 },
            height: { ideal: 640 },
          },
          audio: false,
        },
        {
          video: {
            facingMode: 'user',
          },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      let stream = null;
      let lastCameraError = null;

      for (const constraints of cameraConstraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (error) {
          lastCameraError = error;
        }
      }

      if (!stream) {
        throw lastCameraError || new Error('Camera access failed.');
      }

      streamRef.current = stream;
      setCameraStream(stream);
      setIsCameraOn(true);
      setCameraError('');
    } catch (error) {
      setIsCameraReady(false);
      setIsCameraOn(false);
      setCameraStream(null);

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const messages = {
        AbortError: 'Camera start was interrupted. Please close other camera apps and try again.',
        NotAllowedError: 'Camera permission was denied. Please allow camera access in your browser settings.',
        NotFoundError: 'No camera device was found.',
        NotReadableError: 'Your camera is already being used by another app.',
        OverconstrainedError: 'Your phone camera does not support the requested settings. Please try again.',
        SecurityError: 'Camera access needs HTTPS on phones. Please open the secure https:// link.',
      };

      setCameraError(messages[error?.name] || 'Camera access failed. Please refresh and try again.');
    } finally {
      isStartingCameraRef.current = false;
      setIsStartingCamera(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      isStartingCameraRef.current = false;
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (currentPage === 'camera' && isCameraPreferredOn && !isTouchCameraDevice()) {
      startCamera();
      return;
    }

    if (currentPage !== 'camera') {
      stopCamera(false);
    }
  }, [currentPage, isCameraPreferredOn, startCamera, stopCamera]);

  const handleToggleCamera = useCallback(() => {
    if (isToolDisabled) return;

    triggerTimedAnimation('cameraToggle', setIsCameraToggleAnimating, 420);
    triggerMobileCameraAction(isCameraOn || isStartingCamera || streamRef.current ? 'off' : 'on');

    if (isCameraOn || isStartingCamera || streamRef.current) {
      stopCamera(true);
      return;
    }

    saveCameraPreference(true);
    startCamera();
  }, [
    isCameraOn,
    isStartingCamera,
    isToolDisabled,
    saveCameraPreference,
    startCamera,
    stopCamera,
    triggerMobileCameraAction,
    triggerTimedAnimation,
  ]);

  const captureSingleFrame = useCallback(() => {
    if (!cameraPreviewRef.current || !isCameraReady || !isCameraOn) return null;
    return cameraPreviewRef.current.captureFrame();
  }, [isCameraOn, isCameraReady]);

  const drawRoundedRect = useCallback((context, x, y, width, height, radius) => {
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
  }, []);

  const loadImage = useCallback(
    (src) =>
      new Promise((resolve, reject) => {
        if (!src) {
          resolve(null);
          return;
        }

        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;

        if (typeof src === 'string' && !src.startsWith('data:') && !src.startsWith('blob:')) {
          image.crossOrigin = 'anonymous';
        }

        image.src = src;
      }),
    []
  );

  const drawCoverImage = useCallback((context, image, x, y, width, height) => {
    if (!image) return;

    const imageRatio = image.width / image.height;
    const targetRatio = width / height;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (imageRatio > targetRatio) {
      sourceWidth = image.height * targetRatio;
      sourceX = (image.width - sourceWidth) / 2;
    } else {
      sourceHeight = image.width / targetRatio;
      sourceY = (image.height - sourceHeight) / 2;
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
  }, []);

  const drawPhotoStripCanvas = useCallback(
    async ({ frames, stripColor = CREAM, stripImage = '', date = new Date() }) => {
      const stripCanvas = stripCanvasRef.current;
      if (!stripCanvas || !frames?.length) return null;

      const isFourFrameStrip = frames.length >= 4;
      const isMobileCanvas =
        typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

      const scale = isMobileCanvas ? 1.5 : 3;
      const stripWidth = isFourFrameStrip ? 525 : 630;
      const paddingX = isFourFrameStrip ? 30 : 42;
      const paddingTop = isFourFrameStrip ? 60 : 78;
      const paddingBottom = isFourFrameStrip ? 42 : 54;
      const logoHeight = isFourFrameStrip ? 42 : 56;
      const logoMarginBottom = isFourFrameStrip ? 30 : 36;
      const frameGap = isFourFrameStrip ? 18 : 24;
      const dateMarginTop = isFourFrameStrip ? 24 : 32;
      const dateHeight = isFourFrameStrip ? 28 : 34;

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

      stripCanvas.width = Math.round(stripWidth * scale);
      stripCanvas.height = Math.round(stripHeight * scale);

      const context = stripCanvas.getContext('2d', {
        alpha: true,
        willReadFrequently: false,
      });

      if (!context) return null;

      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, stripWidth, stripHeight);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = isMobileCanvas ? 'medium' : 'high';

      const contrastColor = stripImage ? CREAM : getContrastColor(stripColor);
      const outerRadius = isFourFrameStrip ? 48 : 60;
      const frameRadius = isFourFrameStrip ? 18 : 24;

      context.save();
      drawRoundedRect(context, 0, 0, stripWidth, stripHeight, outerRadius);
      context.clip();

      context.fillStyle = stripColor;
      context.fillRect(0, 0, stripWidth, stripHeight);

      const stripBackgroundImageUrl = getBackgroundImageUrl(stripImage);

      if (stripBackgroundImageUrl) {
        try {
          const backgroundImage = await loadImage(stripBackgroundImageUrl);
          drawCoverImage(context, backgroundImage, 0, 0, stripWidth, stripHeight);

          context.save();
          context.globalAlpha = 0.1;
          context.fillStyle = NAVY;
          context.fillRect(0, 0, stripWidth, stripHeight);
          context.restore();
        } catch {
          context.fillStyle = stripColor;
          context.fillRect(0, 0, stripWidth, stripHeight);
        }
      }

      context.restore();

      context.save();
      drawRoundedRect(context, 0.5, 0.5, stripWidth - 1, stripHeight - 1, outerRadius);
      context.strokeStyle = NAVY;
      context.lineWidth = 1;
      context.stroke();
      context.restore();

      context.save();
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = contrastColor;
      context.font = `900 ${isFourFrameStrip ? 48 : 64}px Georgia, "Times New Roman", serif`;
      context.shadowColor = 'rgba(0, 0, 0, 0.25)';
      context.shadowBlur = isMobileCanvas ? 1.5 : 3;
      context.shadowOffsetY = 2;
      context.fillText('Photo2y', stripWidth / 2, paddingTop + logoHeight / 2 - 2);
      context.restore();

      const images = await Promise.all(
        frames.map(async (src) => {
          try {
            return await loadImage(src);
          } catch {
            return null;
          }
        })
      );

      let currentY = paddingTop + logoHeight + logoMarginBottom;

      images.forEach((image) => {
        if (!image) {
          currentY += frameHeight + frameGap;
          return;
        }

        context.save();
        drawRoundedRect(context, paddingX, currentY, frameWidth, frameHeight, frameRadius);
        context.clip();

        drawCoverImage(context, image, paddingX, currentY, frameWidth, frameHeight);

        context.restore();

        currentY += frameHeight + frameGap;
      });

      const dateText = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      const timeText = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      currentY += dateMarginTop - frameGap;

      context.save();
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = contrastColor;
      context.font = `900 ${isFourFrameStrip ? 18 : 22}px Arial, sans-serif`;
      context.shadowColor = 'rgba(0, 0, 0, 0.25)';
      context.shadowBlur = isMobileCanvas ? 1.5 : 3;
      context.shadowOffsetY = 2;
      context.fillText(
        `${dateText} • ${timeText}`.toUpperCase(),
        stripWidth / 2,
        currentY + dateHeight / 2
      );
      context.restore();

      return stripCanvas.toDataURL('image/png');
    },
    [drawCoverImage, drawRoundedRect, loadImage]
  );

  const createPhotoStrip = useCallback(
    async (shots) => {
      if (!shots.length) return null;

      return drawPhotoStripCanvas({
        frames: shots,
        stripColor: selectedStripColor,
        stripImage: selectedStripImage,
        date: new Date(),
      });
    },
    [drawPhotoStripCanvas, selectedStripColor, selectedStripImage]
  );

  const createPhotoData = useCallback(
    (shots, stripUrl = null) => ({
      id: createSafeId(),
      src: stripUrl || shots[0],
      frames: shots,
      stickers: [],
      photoStickers: [],
      label: `Photo Strip ${photos.length + 1}`,
      createdAt: new Date().toISOString(),

      stripColor: selectedStripColor,
      selectedStripColor,

      stripImage: selectedStripImage,
      selectedStripImage,

      design: {
        stripColor: selectedStripColor,
        selectedStripColor,
        stripImage: selectedStripImage,
        selectedStripImage,
      },

      stripDesign: {
        stripColor: selectedStripColor,
        selectedStripColor,
        stripImage: selectedStripImage,
        selectedStripImage,
      },

      filter: selectedFilter,
      classicFilter: selectedClassicFilter,
      blackWhiteShadowColor: selectedBlackWhiteShadowColor,
    }),
    [
      photos.length,
      selectedBlackWhiteShadowColor,
      selectedClassicFilter,
      selectedFilter,
      selectedStripColor,
      selectedStripImage,
    ]
  );

  const finishBoothSession = useCallback(
    async (shots) => {
      setIsPrinting(true);
      setIsPrintReady(false);
      setCurrentShotNumber(shots.length);
      clearCountdown();

      let stripUrl = null;

      try {
        stripUrl = await createPhotoStrip(shots);
      } catch {
        stripUrl = null;
      }

      const finishedPhotoStrip = createPhotoData(shots, stripUrl);

      setPendingPhotoStrip(finishedPhotoStrip);
      setPhotos((prev) => {
        const alreadySaved = prev.some((photo) => photo.id === finishedPhotoStrip.id);
        return alreadySaved ? prev : [finishedPhotoStrip, ...prev];
      });

      try {
        const savedPhotoStrip = await savePhotoToDatabase(finishedPhotoStrip);

        setPendingPhotoStrip(savedPhotoStrip);
        setPhotos((prev) => {
          const withoutTemporaryVersion = prev.filter((photo) => photo.id !== finishedPhotoStrip.id);
          const withoutSavedDuplicate = withoutTemporaryVersion.filter(
            (photo) => photo.id !== savedPhotoStrip.id
          );

          return [savedPhotoStrip, ...withoutSavedDuplicate];
        });
      } catch (error) {
        console.error('Failed to save finished photo strip to database:', error);
      }

      clearTimer('print');
      timersRef.current.print = setTimeout(() => {
        setIsPrinting(false);
        setIsPrintReady(true);
        setIsBoothSessionActive(false);
        timersRef.current.print = null;
      }, isMobilePerformanceMode ? 2800 : 3600);
    },
    [clearCountdown, clearTimer, createPhotoData, createPhotoStrip, isMobilePerformanceMode]
  );

  const runShotCountdown = useCallback(
    (shotIndex, collectedShots) => {
      setCurrentShotNumber(shotIndex + 1);
      setIsGettingReady(true);
      setIsCountingDown(false);
      setCountdown(null);

      clearTimer('ready');
      clearTimer('countdown');
      clearTimer('next');

      timersRef.current.ready = setTimeout(
        () => {
          setIsGettingReady(false);
          setIsCountingDown(true);
          setCountdown(3);

          let currentCount = 3;

          timersRef.current.countdown = setInterval(() => {
            currentCount -= 1;

            if (currentCount > 0) {
              setCountdown(currentCount);
              return;
            }

            clearCountdown();
            triggerPhotoFlash();

            const capturedFrame = captureSingleFrame();

            if (!capturedFrame) {
              setIsBoothSessionActive(false);
              setBoothShots([]);
              setCurrentShotNumber(0);
              return;
            }

            const nextShots = [...collectedShots, capturedFrame];
            setBoothShots(nextShots);

            if (nextShots.length >= selectedShotCount) {
              finishBoothSession(nextShots);
              return;
            }

            timersRef.current.next = setTimeout(
              () => {
                runShotCountdown(shotIndex + 1, nextShots);
              },
              isMobilePerformanceMode ? 500 : 700
            );
          }, 1000);
        },
        isMobilePerformanceMode ? 650 : 900
      );
    },
    [
      captureSingleFrame,
      clearCountdown,
      clearTimer,
      finishBoothSession,
      isMobilePerformanceMode,
      selectedShotCount,
      triggerPhotoFlash,
    ]
  );

  const startPhotoboothSession = useCallback(() => {
    if (!isCameraReady || !isCameraOn || cameraError || isBusy) return;

    setBoothShots([]);
    setCurrentShotNumber(1);
    setIsBoothSessionActive(true);
    setActivePanel(null);
    setHoverPreview(null);
    runShotCountdown(0, []);
  }, [cameraError, isBusy, isCameraOn, isCameraReady, runShotCountdown]);

  const handleTakePhoto = useCallback(() => {
    if (currentPage === 'photos') {
      setCurrentPage('camera');
      return;
    }

    startPhotoboothSession();
  }, [currentPage, startPhotoboothSession]);

  const handlePickUpPrint = useCallback(async () => {
    let photoToSave = pendingPhotoStrip;

    if (!photoToSave && boothShots.length) {
      let stripUrl = null;

      try {
        stripUrl = await createPhotoStrip(boothShots);
      } catch {
        stripUrl = null;
      }

      photoToSave = createPhotoData(boothShots, stripUrl);
    }

    if (!photoToSave?.src) return;

    setPhotos((prev) => {
      const alreadySaved = prev.some((photo) => photo.id === photoToSave.id);
      return alreadySaved ? prev : [photoToSave, ...prev];
    });

    setPendingPhotoStrip(null);
    setIsPrintReady(false);
    setIsPrinting(false);
    setIsBoothSessionActive(false);
    setBoothShots([]);
    setCurrentShotNumber(0);
    setCurrentPage('photos');
  }, [boothShots, createPhotoData, createPhotoStrip, pendingPhotoStrip]);

  const handleArchivePhoto = useCallback(
    async (id) => {
      const photo = photos.find((item) => item.id === id);
      if (!photo) return;

      const archivedPhoto = { ...photo, archivedAt: new Date().toISOString() };

      setPhotos((prev) => prev.filter((item) => item.id !== id));
      setArchivedPhotos((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== id);
        return [archivedPhoto, ...withoutDuplicate];
      });

      try {
        await archivePhotoInDatabase(id);
      } catch (error) {
        console.error('Failed to archive photo in database:', error);
      }
    },
    [photos]
  );

  const handleRestorePhoto = useCallback(
    async (id) => {
      const photo = archivedPhotos.find((item) => item.id === id);
      if (!photo) return;

      const restoredPhoto = { ...photo, archivedAt: null };

      setArchivedPhotos((prev) => prev.filter((item) => item.id !== id));
      setPhotos((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== id);
        return [restoredPhoto, ...withoutDuplicate];
      });

      try {
        await restorePhotoInDatabase(id);
      } catch (error) {
        console.error('Failed to restore photo in database:', error);
      }
    },
    [archivedPhotos]
  );

  const handlePermanentDeletePhoto = useCallback(async (id) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    setArchivedPhotos((prev) => prev.filter((photo) => photo.id !== id));

    try {
      await deletePhotoFromDatabase(id);
    } catch (error) {
      console.error('Failed to delete photo from database:', error);
    }
  }, []);

  const handleEditPhoto = useCallback(async (id, newLabel) => {
    const rename = (photo) => (photo.id === id ? { ...photo, label: newLabel } : photo);

    setPhotos((prev) => prev.map(rename));
    setArchivedPhotos((prev) => prev.map(rename));

    try {
      await renamePhotoInDatabase(id, newLabel);
    } catch (error) {
      console.error('Failed to rename photo in database:', error);
    }
  }, []);

  const handleSavePhotoStickers = useCallback(async (id, stickers = []) => {
    const updateStickers = (photo) =>
      photo.id === id
        ? {
            ...photo,
            stickers,
            photoStickers: stickers,
          }
        : photo;

    setPhotos((prev) => prev.map(updateStickers));
    setArchivedPhotos((prev) => prev.map(updateStickers));

    try {
      const savedStickers = await savePhotoStickersToDatabase(id, stickers);

      const applySavedStickers = (photo) =>
        photo.id === id
          ? {
              ...photo,
              stickers: savedStickers,
              photoStickers: savedStickers,
            }
          : photo;

      setPhotos((prev) => prev.map(applySavedStickers));
      setArchivedPhotos((prev) => prev.map(applySavedStickers));
    } catch (error) {
      console.error('Failed to save photo stickers in database:', error);
    }
  }, []);

  const handleDownloadPhoto = useCallback(
    async (photo) => {
      const frames = getFrames(photo);
      if (!frames.length) return;

      const theme = getPhotoStripTheme(photo);
      const photoDate = getPhotoDate(photo);

      let downloadUrl = null;

      try {
        downloadUrl = await drawPhotoStripCanvas({
          frames,
          stripColor: theme.stripColor,
          stripImage: theme.stripImage,
          date: photoDate,
        });
      } catch {
        downloadUrl = photo.src;
      }

      if (!downloadUrl) return;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${sanitizeFileName(photo.label || 'photo-strip')}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    [drawPhotoStripCanvas]
  );

  const cancelPhotoboothSession = useCallback(() => {
    clearCountdown();
    clearTimer('flash');
    setIsFlashing(false);
    resetBoothState();
    setPendingPhotoStrip(null);
  }, [clearCountdown, clearTimer, resetBoothState]);

  const handleStripDesignHoverMove = useCallback(
    (event, previewData) => {
      if (shouldReduceHoverPreview) return;

      setCursorPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setHoverPreview(previewData);
    },
    [shouldReduceHoverPreview]
  );

  const handleFilterChange = useCallback(
    (filterId) => {
      if (isToolDisabled || selectedFilter === filterId) return;

      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
        filterChangeTimeoutRef.current = null;
      }

      setFilterBurstColor(getFilterBurstColor(filterId));
      triggerFilterBurstAnimation();
      triggerOptionTapAnimation('classicFilterTap', setAnimatedClassicFilterId, filterId, 520);

      setSelectedFilter(filterId);
      setFilterPreviewVersion((currentVersion) => currentVersion + 1);

      if (isMobilePerformanceMode) return;

      filterChangeTimeoutRef.current = setTimeout(() => {
        setFilterPreviewVersion((currentVersion) => currentVersion + 1);
        filterChangeTimeoutRef.current = null;
      }, 180);
    },
    [
      isMobilePerformanceMode,
      isToolDisabled,
      selectedFilter,
      triggerFilterBurstAnimation,
      triggerOptionTapAnimation,
    ]
  );

  const renderFilterOptionControls = (isInsidePanel = false) => {
    const wrapperClassName = isInsidePanel
      ? 'mt-4 rounded-[22px] border-2 border-[#05102D] bg-white/45 p-3'
      : 'mt-3';

    if (selectedFilter === 'classic') {
      return (
        <div className={`${wrapperClassName} flex flex-wrap items-center justify-center gap-2`}>
          {classicFilterOptions.map((classicOption) => {
            const isSelected = selectedClassicFilter === classicOption.id;

            return (
              <button
                key={classicOption.id}
                type="button"
                onClick={() => {
                  triggerOptionTapAnimation(
                    'classicFilterTap',
                    setAnimatedClassicFilterId,
                    classicOption.id,
                    520
                  );
                  setSelectedClassicFilter(classicOption.id);
                  setFilterPreviewVersion((currentVersion) => currentVersion + 1);
                }}
                disabled={isToolDisabled}
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#05102D]
                  text-xs font-black uppercase tracking-wider transition-all duration-200 ease-out
                  md:hover:-translate-y-0.5 md:hover:shadow-[2px_3px_0_#05102D] active:translate-y-0 active:shadow-none
                  ${
                    isSelected
                      ? classicOption.id === 'fishEye'
                        ? 'bg-[#05102D] text-[#FDF9F2] shadow-[2px_3px_0_#05102D]'
                        : 'bg-[#1D56CF] text-[#FDF9F2] shadow-[2px_3px_0_#05102D]'
                      : 'bg-[#FDF9F2] text-[#05102D]'
                  }
                  ${
                    animatedClassicFilterId === classicOption.id
                      ? 'md:motion-safe:animate-cartoon-pop'
                      : ''
                  }
                  ${isToolDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                aria-label={`Choose classic filter ${classicOption.label}`}
                title={classicOption.label}
              >
                <img
                  src={classicOption.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      );
    }

    if (selectedFilter === 'blackWhite') {
      return (
        <div className={`${wrapperClassName} flex items-center justify-center gap-2`}>
          {blackWhiteShadowColorOptions.map((colorOption) => {
            const isSelected = selectedBlackWhiteShadowColor === colorOption.value;

            return (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => {
                  triggerOptionTapAnimation(
                    'colorOptionTap',
                    setAnimatedColorOption,
                    colorOption.value,
                    520
                  );
                  setFilterBurstColor(colorOption.color);
                  triggerFilterBurstAnimation();
                  setSelectedBlackWhiteShadowColor(colorOption.value);
                  setFilterPreviewVersion((currentVersion) => currentVersion + 1);
                }}
                disabled={isToolDisabled}
                className={`
                  h-8 w-8 rounded-full border-2 border-[#05102D] transition-all duration-200 ease-out
                  md:hover:-translate-y-0.5 md:hover:scale-110 active:translate-y-0 active:scale-95
                  ${isSelected ? 'scale-110 shadow-[0_0_0_4px_#1D56CF]' : ''}
                  ${
                    animatedColorOption === colorOption.value
                      ? 'md:motion-safe:animate-cartoon-pop'
                      : ''
                  }
                  ${isToolDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={{ backgroundColor: colorOption.color }}
                aria-label={`Choose black and white shadow color ${colorOption.label}`}
                title={colorOption.label}
              />
            );
          })}
        </div>
      );
    }

    if (selectedFilter === 'dither') {
      return (
        <div className={`${wrapperClassName} flex items-center justify-center gap-2`}>
          {ditherColorOptions.map((color) => {
            const isSelected = selectedDitherColor === color;

            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  triggerOptionTapAnimation(
                    'colorOptionTap',
                    setAnimatedColorOption,
                    color,
                    520
                  );
                  setFilterBurstColor(color);
                  triggerFilterBurstAnimation();
                  setSelectedDitherColor(color);
                  setFilterPreviewVersion((currentVersion) => currentVersion + 1);
                }}
                disabled={isToolDisabled}
                className={`
                  h-7 w-7 rounded-full transition-all duration-200 ease-out
                  md:hover:scale-110 active:scale-95
                  ${
                    isSelected
                      ? 'scale-110 ring-2 ring-[#05102D] ring-offset-2 ring-offset-[#FDF9F2]'
                      : ''
                  }
                  ${animatedColorOption === color ? 'md:motion-safe:animate-cartoon-pop' : ''}
                  ${isToolDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={{ backgroundColor: color }}
                aria-label={`Choose dither color ${color}`}
              />
            );
          })}
        </div>
      );
    }

    if (selectedFilter === 'oldFilm') {
      return (
        <div
          className={`${wrapperClassName} flex flex-wrap items-center justify-center gap-2 sm:gap-3`}
        >
          {oldFilmColorOptions.map((colorOption) => {
            const isSelected = selectedOldFilmColor === colorOption.value;

            return (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => {
                  triggerOptionTapAnimation(
                    'colorOptionTap',
                    setAnimatedColorOption,
                    colorOption.value,
                    520
                  );
                  setFilterBurstColor(colorOption.value);
                  triggerFilterBurstAnimation();
                  setSelectedOldFilmColor(colorOption.value);
                  setFilterPreviewVersion((currentVersion) => currentVersion + 1);
                }}
                disabled={isToolDisabled}
                className={`
                  h-8 w-8 rounded-full border-2 border-[#05102D] transition-all duration-200 ease-out
                  md:hover:-translate-y-0.5 md:hover:scale-110 active:translate-y-0 active:scale-95
                  ${isSelected ? 'scale-110 shadow-[0_0_0_4px_#1D56CF]' : ''}
                  ${
                    animatedColorOption === colorOption.value
                      ? 'md:motion-safe:animate-cartoon-pop'
                      : ''
                  }
                  ${isToolDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={{ backgroundColor: colorOption.value }}
                aria-label={colorOption.label}
                title={colorOption.label}
              />
            );
          })}
        </div>
      );
    }

    return null;
  };

  const renderToolPanel = () => {
    if (!activePanel) return null;

    const panelTitle =
      activePanel === 'photoStrip'
        ? 'Number of photos'
        : activePanel === 'stripDesign'
          ? 'Strip design'
          : 'Filter';

    return (
      <div className="fixed inset-x-3 bottom-20 z-[80] max-h-[70vh] overflow-y-auto rounded-[26px] border-2 border-[#05102D] bg-[#FDF9F2] p-3 text-[#05102D] shadow-[4px_5px_0_#05102D] sm:inset-x-auto sm:left-[5.8rem] sm:top-1/2 sm:bottom-auto sm:w-[360px] sm:max-w-[calc(100vw-7rem)] sm:max-h-[62vh] sm:-translate-y-1/2 sm:overflow-visible sm:rounded-[30px] sm:p-4 sm:shadow-[6px_7px_0_#05102D] md:left-[6.4rem] md:motion-safe:animate-cartoon-panel">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl font-black leading-none text-[#1D56CF] sm:text-2xl">
            {panelTitle}
          </h3>

          <button
            type="button"
            onClick={() => {
              setActivePanel(null);
              setHoverPreview(null);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#05102D] bg-[#1D56CF] text-xl font-black leading-none text-[#FDF9F2] transition-all duration-200 md:hover:-translate-y-1 md:hover:bg-[#1746A8] md:hover:shadow-[3px_4px_0_#05102D] active:translate-y-1 active:shadow-none"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {activePanel === 'photoStrip' && (
          <PhotoboothNumberOfPhotos
            selectedShotCount={selectedShotCount}
            setSelectedShotCount={setSelectedShotCount}
            isDisabled={isToolDisabled}
          />
        )}

        {activePanel === 'stripDesign' && (
          <PhotoboothStripDesign
            selectedShotCount={selectedShotCount}
            selectedStripColor={selectedStripColor}
            selectedStripImage={selectedStripImage}
            setSelectedStripColor={setSelectedStripColor}
            setSelectedStripImage={setSelectedStripImage}
            isDisabled={isToolDisabled}
            handleHoverMove={handleStripDesignHoverMove}
            setHoverPreview={shouldReduceHoverPreview ? () => {} : setHoverPreview}
          />
        )}

        {activePanel === 'filter' && (
          <>
            <PhotoboothFilter
              selectedFilter={selectedFilter}
              setSelectedFilter={handleFilterChange}
              isDisabled={isToolDisabled}
            />

            <div className="sm:hidden">{renderFilterOptionControls(true)}</div>
          </>
        )}
      </div>
    );
  };

  const renderHoverPreview = () => {
    if (!hoverPreview || shouldReduceHoverPreview) return null;

    return (
      <div
        className="pointer-events-none fixed z-[99999] rounded-[24px] border-2 border-[#05102D] bg-[#FDF9F2] p-3 text-[#05102D] motion-safe:animate-cartoon-pop"
        style={{
          left: cursorPosition.x + 20,
          top: cursorPosition.y + 20,
        }}
      >
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#1D56CF]">
          {hoverPreview.label}
        </p>

        {hoverPreview.selectedStripColor ? (
          <MiniStripPreview
            selectedShotCount={hoverPreview.count || selectedShotCount}
            selectedStripColor={hoverPreview.selectedStripColor}
            selectedStripImage={hoverPreview.selectedStripImage || ''}
          />
        ) : (
          <div className="h-40 w-24 rounded-[18px] bg-[#FDF9F2]" />
        )}
      </div>
    );
  };

  const renderToolbar = () => (
    <aside className="fixed inset-x-0 bottom-3 z-[70] flex justify-center px-3 sm:inset-x-auto sm:left-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:flex-col sm:px-0 md:left-5">
      <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-[22px] bg-transparent p-1.5 sm:flex-col sm:gap-3 sm:overflow-visible sm:p-1 md:gap-4 md:p-1.5">
        {photoboothTools.map((tool) => {
          const isActive = activePanel === tool.id;
          const isClicked = animatedToolId === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                triggerFloatingToolAnimation(tool.id);
                setActivePanel(isActive ? null : tool.id);
              }}
              disabled={isToolDisabled}
              className={`photo2y-no-cartoon-animation group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[15px] border-2 border-[#05102D] transition-all duration-200 ease-out active:translate-y-1 active:shadow-none sm:h-12 sm:w-12 sm:rounded-2xl md:h-[52px] md:w-[52px] md:rounded-[18px] ${
                isActive
                  ? 'bg-[#FDF9F2] shadow-[2px_3px_0_#1D56CF] ring-2 ring-[#1D56CF] ring-offset-1 ring-offset-[#FDF9F2] md:hover:-translate-y-0.5 md:hover:shadow-[3px_4px_0_#1D56CF]'
                  : `bg-[#FDF9F2] shadow-[1px_2px_0_#05102D] md:hover:-translate-y-0.5 ${tool.rotate} md:hover:shadow-[3px_4px_0_#05102D]`
              } ${isClicked ? 'md:motion-safe:animate-floating-tool-click' : ''} ${
                isToolDisabled ? 'cursor-not-allowed opacity-60' : ''
              }`}
              title={tool.title}
              aria-label={tool.title}
            >
              <span className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[inherit] md:block">
                <span
                  className={`absolute inset-y-0 left-[-60%] h-full w-[42%] bg-gradient-to-r from-transparent via-[#FDF9F2]/30 to-transparent ${
                    isClicked
                      ? 'motion-safe:animate-floating-tool-shine'
                      : 'opacity-0 md:group-hover:motion-safe:animate-floating-tool-shine-once'
                  }`}
                />
              </span>

              <span className="relative z-10 h-6 w-6 sm:h-7 sm:w-7 md:h-7 md:w-7">
                <img
                  src={tool.iconBlue}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 h-6 w-6 object-contain transition-transform duration-200 sm:h-7 sm:w-7 md:h-7 md:w-7 ${
                    isClicked
                      ? 'md:motion-safe:animate-floating-icon-click'
                      : isActive
                        ? 'opacity-100 md:scale-110'
                        : 'opacity-100 md:group-hover:scale-110'
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh min-h-dvh w-screen flex-col overflow-hidden bg-[#FDF9F2] text-[#05102D]">
      <Header
        photoCount={photos.length}
        archivedPhotoCount={archivedPhotos.length}
        currentPage={currentPage}
        onHomeClick={() => setCurrentPage('camera')}
        onPhotosClick={() => setCurrentPage('photos')}
        onTakePhotoClick={handleTakePhoto}
        isCameraReady={isCameraReady}
        isCameraOn={isCameraOn}
        isCountingDown={isBusy}
      />

      <main className="photo2y-scroll-main relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {currentPage === 'camera' && (
          <>
            {renderToolbar()}
            {renderToolPanel()}
            {renderHoverPreview()}

            <section className="flex min-h-full w-full flex-col items-center justify-center px-3 pb-28 pt-4 sm:px-4 sm:py-6">
              <div className="w-full max-w-7xl rounded-[26px] bg-[#FDF9F2] p-2 text-[#05102D] sm:rounded-[32px] sm:p-4 md:p-6">
                <div className="mb-3 text-center sm:mb-5">
                  <h2 className="font-serif text-5xl font-black leading-none text-[#1D56CF] md:motion-safe:animate-cartoon-wiggle sm:text-5xl md:text-6xl">
                    Strike a Pose
                  </h2>

                  <p className="mt-1 text-sm font-bold tracking-wide text-[#05102D]/80 sm:text-sm md:text-base">
                    Snap your moments, print your memories.
                  </p>
                </div>

                <div className="mx-auto w-full max-w-6xl">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      <div
                        className={`h-3 w-3 shrink-0 rounded-full transition-transform duration-300 sm:h-4 sm:w-4 ${
                          isCameraReady && isCameraOn
                            ? 'scale-110 bg-[#1D56CF] md:motion-safe:animate-cartoon-blink'
                            : isStartingCamera
                              ? 'scale-125 bg-[#1D56CF] md:motion-safe:animate-cartoon-blink md:motion-safe:animate-pulse'
                              : 'bg-[#05102D]'
                        } ${mobileCameraAction ? 'md:motion-safe:animate-ping' : ''}`}
                      />

                      <span className="truncate text-xs font-black uppercase tracking-wider sm:text-sm">
                        {isCameraReady && isCameraOn
                          ? 'You ready?'
                          : isStartingCamera
                            ? 'Opening camera'
                            : 'Your camera is off'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      disabled={isStartingCamera || isToolDisabled}
                      className={`group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#05102D] bg-[#1D56CF] transition-all duration-200 ease-out active:translate-y-1 active:shadow-none sm:h-12 sm:w-12 ${
                        isStartingCamera || isToolDisabled
                          ? 'cursor-not-allowed opacity-60'
                          : 'md:hover:-translate-y-1 md:hover:rotate-[3deg] md:hover:bg-[#1746A8] md:hover:shadow-[3px_4px_0_#05102D]'
                      } ${
                        isCameraToggleAnimating ? 'md:motion-safe:animate-camera-slide-shell' : ''
                      } ${
                        mobileCameraAction === 'on'
                          ? 'md:motion-safe:animate-cartoon-pop'
                          : mobileCameraAction === 'off'
                            ? 'md:motion-safe:animate-floating-tool-click'
                            : ''
                      }`}
                      title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                      aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                      <span
                        className={`absolute inset-y-0 left-0 hidden w-full md:block ${
                          isCameraToggleAnimating
                            ? 'bg-[#FDF9F2]/35 motion-safe:animate-camera-slide-door'
                            : 'translate-x-[-130%] bg-transparent'
                        }`}
                      />

                      <span
                        className={`pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[inherit] md:block ${
                          mobileCameraAction ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FDF9F2]/25 motion-safe:animate-ping" />
                      </span>

                      <img
                        key={isCameraOn || isStartingCamera ? 'camera-off' : 'camera-on'}
                        src={isCameraOn || isStartingCamera ? icons.cameraOff : icons.cameraOn}
                        alt=""
                        aria-hidden="true"
                        className={`relative z-10 h-6 w-6 object-contain transition-transform duration-200 md:group-hover:scale-125 ${
                          isCameraToggleAnimating ? 'md:motion-safe:animate-camera-icon-slide' : ''
                        }`}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  </div>

                  <div
                    className={`mx-auto flex h-[52vh] min-h-[390px] w-full max-w-[min(100%,980px)] items-center justify-center overflow-hidden rounded-[28px] bg-black transition-transform duration-300 sm:h-auto sm:min-h-0 sm:rounded-none sm:bg-transparent [&>*]:h-full [&>*]:w-full sm:[&>*]:h-auto sm:[&>*]:w-full ${
                      isStartingCamera || mobileCameraAction === 'on'
                        ? 'md:motion-safe:animate-cartoon-pop'
                        : mobileCameraAction === 'off'
                          ? 'md:motion-safe:animate-floating-tool-click'
                          : ''
                    }`}
                  >
                    <PhotoboothCameraPreview
                      ref={cameraPreviewRef}
                      stream={cameraStream}
                      icons={icons}
                      selectedFilter={selectedFilter}
                      selectedClassicFilter={selectedClassicFilter}
                      selectedDitherColor={selectedDitherColor}
                      selectedOldFilmColor={selectedOldFilmColor}
                      key={`camera-preview-${filterPreviewVersion}`}
                      filterEffectSettings={activeFilterEffectSettings}
                      isCameraOn={isCameraOn}
                      isCameraReady={isCameraReady}
                      isStartingCamera={isStartingCamera}
                      cameraError={cameraError}
                      setIsCameraReady={setIsCameraReady}
                      setIsStartingCamera={setIsStartingCamera}
                      setCameraError={setCameraError}
                      isFilterBurstAnimating={isFilterBurstAnimating}
                      filterBurstKey={filterBurstKey}
                      filterBurstColor={filterBurstColor}
                      filterBurstColors={
                        selectedFilter === 'sunsetFade'
                          ? activeFilterEffectSettings.sunsetFade.rainbowColors
                          : [filterBurstColor]
                      }
                      isFlashing={isFlashing}
                      isGettingReady={isGettingReady}
                      isCountingDown={isCountingDown}
                      currentShotNumber={currentShotNumber}
                      selectedShotCount={selectedShotCount}
                      countdown={countdown}
                      onTryAgain={startCamera}
                      onOpenCamera={() => {
                        triggerTimedAnimation('cameraToggle', setIsCameraToggleAnimating, 420);
                        triggerMobileCameraAction('on');
                        setIsCameraPreferredOn(true);
                        startCamera();
                      }}
                    />
                  </div>

                  <div className="hidden sm:block">{renderFilterOptionControls(false)}</div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 md:grid-cols-[1fr_auto]">
                    <button
                      type="button"
                      onClick={startPhotoboothSession}
                      disabled={!isCameraReady || !isCameraOn || Boolean(cameraError) || isBusy}
                      className={`w-full rounded-[22px] border-2 border-[#05102D] py-4 text-base font-black uppercase tracking-wider transition-all duration-200 ease-out active:translate-y-1 active:shadow-none sm:rounded-[24px] sm:py-5 sm:text-xl ${
                        isCameraReady && isCameraOn && !cameraError && !isBusy
                          ? 'bg-[#1D56CF] text-[#FDF9F2] md:hover:-translate-y-1 md:hover:rotate-[-0.6deg] md:hover:bg-[#1746A8] md:hover:shadow-[5px_6px_0_#05102D]'
                          : 'cursor-not-allowed bg-[#05102D]/20 text-[#05102D]/50'
                      }`}
                    >
                      {isPrintReady
                        ? 'Print ready'
                        : isPrinting
                          ? 'Printing...'
                          : isBoothSessionActive
                            ? 'Taking photos...'
                            : 'Take photos!'}
                    </button>

                    {isBoothSessionActive && !isPrinting && !isPrintReady && (
                      <button
                        type="button"
                        onClick={cancelPhotoboothSession}
                        className="rounded-[22px] border-2 border-[#05102D] bg-[#1D56CF] px-5 py-4 text-base font-black uppercase tracking-wider text-[#FDF9F2] transition-all duration-200 ease-out md:hover:-translate-y-1 md:hover:rotate-[1deg] md:hover:bg-[#1746A8] md:hover:shadow-[5px_6px_0_#05102D] active:translate-y-1 active:shadow-none sm:rounded-[24px] sm:px-6 sm:py-5 sm:text-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <canvas ref={stripCanvasRef} className="hidden" />
              </div>
            </section>
          </>
        )}

        <PrintAnimation
          isPrinting={isPrinting}
          isPrintReady={isPrintReady}
          boothShots={boothShots}
          selectedStripColor={selectedStripColor}
          selectedStripImage={selectedStripImage}
          getBackgroundImageUrl={getBackgroundImageUrl}
          onPickUpPrint={handlePickUpPrint}
        />

        {currentPage === 'photos' && (
          <Photos
            photos={photos}
            archivedPhotos={archivedPhotos}
            isLoadingSavedPhotos={isLoadingSavedPhotos}
            onArchivePhoto={handleArchivePhoto}
            onRestorePhoto={handleRestorePhoto}
            onPermanentDeletePhoto={handlePermanentDeletePhoto}
            onEditPhoto={handleEditPhoto}
            onDownloadPhoto={handleDownloadPhoto}
            onSavePhotoStickers={handleSavePhotoStickers}
            onGoToCamera={() => setCurrentPage('camera')}
          />
        )}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 767px), (hover: none), (pointer: coarse) {
          .photo2y-scroll-main {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;