function PrintAnimation({
  isPrinting,
  isPrintReady,
  boothShots = [],
  selectedStripColor = '#FDF9F2',
  selectedStripImage = '',
  getBackgroundImageUrl,
  onPickUpPrint,
}) {
  if (!isPrinting && !isPrintReady) return null;

  const stripBackgroundImage = selectedStripImage
    ? `linear-gradient(rgba(5,16,45,0.08), rgba(5,16,45,0.08)), url("${getBackgroundImageUrl?.(
        selectedStripImage
      )}")`
    : 'none';

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDF9F2]/95 text-[#05102D]">
      <div className="relative flex max-h-[92vh] flex-col items-center overflow-visible animate-print-overlay-pop">
        <div
          className={`relative z-40 h-24 w-80 overflow-hidden rounded-[28px] bg-[#1D56CF] shadow-[7px_8px_0_#05102D] ${
            isPrinting ? 'animate-printer-soft-bounce' : 'animate-printer-ready-settle'
          }`}
        >
          <div className="absolute inset-x-5 top-4 h-3 rounded-full bg-[#FDF9F2]/25" />

          <div className="absolute right-7 top-6 h-4 w-4 rounded-full border-2 border-[#05102D] bg-[#FDF9F2] animate-printer-soft-light" />

          <div className="absolute inset-y-0 left-0 w-16 bg-[#FDF9F2]/20 animate-printer-soft-shine" />

          <div className="absolute inset-x-5 bottom-5 z-50 h-7 rounded-2xl border-2 border-[#05102D] bg-[#FDF9F2] shadow-[2px_3px_0_#05102D]">
            <div className="absolute inset-x-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#05102D]" />
          </div>
        </div>

        <div className="relative z-10 -mt-6 h-[520px] w-72 overflow-hidden pt-0">
          <div
            className={`absolute left-1/2 top-0 z-10 flex w-52 origin-top flex-col gap-2 rounded-b-[28px] border border-t-0 border-[#05102D] bg-[#FDF9F2] p-3 shadow-[4px_5px_0_#05102D] ${
              isPrinting
                ? 'animate-print-strip-smooth-feed'
                : 'translate-x-[-50%] translate-y-7'
            }`}
            style={{
              backgroundColor: selectedStripColor,
              backgroundImage: stripBackgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {boothShots.map((shot, index) => (
              <div
                key={`${shot}-${index}`}
                className="h-24 w-full overflow-hidden rounded-2xl bg-[#05102D]"
              >
                <img
                  src={shot}
                  alt={`Printing preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            <div className="pt-1 text-center text-[10px] font-black tracking-wider text-[#FDF9F2] drop-shadow">
              PHOTO2Y
            </div>
          </div>
        </div>

        {isPrinting && (
          <>
            <div className="mt-4 flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#05102D] animate-print-soft-dot-one" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#05102D] animate-print-soft-dot-two" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#05102D] animate-print-soft-dot-three" />
            </div>

            <p className="mt-4 text-xl font-black uppercase tracking-wider">
              Printing your strip
            </p>
          </>
        )}

        {isPrintReady && (
          <button
            type="button"
            onClick={onPickUpPrint}
            className="mt-6 rounded-[24px] border-2 border-[#05102D] bg-[#1D56CF] px-8 py-4 text-lg font-black uppercase tracking-wider text-[#FDF9F2] transition-all duration-200 ease-out hover:-translate-y-1 hover:bg-[#1746A8] hover:shadow-[5px_6px_0_#05102D] active:translate-y-1 active:shadow-none"
          >
            Pick up →
          </button>
        )}
      </div>

      <style>{`
        @keyframes printOverlayPop {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes printerSoftBounce {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes printerReadySettle {
          0% {
            transform: translateY(-3px) scale(0.98);
          }

          70% {
            transform: translateY(1px) scale(1.01);
          }

          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes printerSoftShine {
          0% {
            transform: translateX(-120px);
            opacity: 0;
          }

          35% {
            opacity: 1;
          }

          100% {
            transform: translateX(360px);
            opacity: 0;
          }
        }

        @keyframes printerSoftLight {
          0%, 100% {
            transform: scale(1);
            background-color: #FDF9F2;
          }

          50% {
            transform: scale(1.16);
            background-color: #FFE16A;
          }
        }

        @keyframes printStripSmoothFeed {
          0% {
            transform: translate(-50%, -118%);
            opacity: 0;
          }

          10% {
            transform: translate(-50%, -102%);
            opacity: 0;
          }

          16% {
            transform: translate(-50%, -98%);
            opacity: 1;
          }

          32% {
            transform: translate(-50%, -75%);
          }

          50% {
            transform: translate(-50%, -48%);
          }

          68% {
            transform: translate(-50%, -22%);
          }

          86% {
            transform: translate(-50%, 4px);
          }

          100% {
            transform: translate(-50%, 18px);
            opacity: 1;
          }
        }

        @keyframes printSoftDotOne {
          0%, 100% {
            opacity: 0.28;
            transform: translateY(0);
          }

          35% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        @keyframes printSoftDotTwo {
          0%, 100% {
            opacity: 0.28;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        @keyframes printSoftDotThree {
          0%, 100% {
            opacity: 0.28;
            transform: translateY(0);
          }

          65% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        .animate-print-overlay-pop {
          animation: printOverlayPop 220ms ease-out forwards;
        }

        .animate-printer-soft-bounce {
          animation: printerSoftBounce 760ms ease-in-out infinite;
          transform-origin: center bottom;
        }

        .animate-printer-ready-settle {
          animation: printerReadySettle 360ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .animate-printer-soft-shine {
          animation: printerSoftShine 1.8s ease-in-out infinite;
        }

        .animate-printer-soft-light {
          animation: printerSoftLight 900ms ease-in-out infinite;
        }

        .animate-print-strip-smooth-feed {
          animation: printStripSmoothFeed 3.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform, opacity;
        }

        .animate-print-soft-dot-one {
          animation: printSoftDotOne 1s ease-in-out infinite;
        }

        .animate-print-soft-dot-two {
          animation: printSoftDotTwo 1s ease-in-out infinite;
        }

        .animate-print-soft-dot-three {
          animation: printSoftDotThree 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default PrintAnimation;