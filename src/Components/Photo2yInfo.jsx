// src/Components/Photo2yInfo.jsx

function Photo2yInfo({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#05102D]/80 px-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close Photo2y info"
      />

      <div className="relative z-10 w-full max-w-md rounded-[34px] border-2 border-[#05102D] bg-[#FDF9F2] p-6 text-[#05102D] shadow-[8px_10px_0_#1D56CF] animate-photo2y-info-pop">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#05102D] bg-[#1D56CF] text-xl font-black leading-none text-[#FDF9F2] transition-all duration-200 hover:-translate-y-1 hover:shadow-[3px_4px_0_#05102D] active:translate-y-1 active:shadow-none"
          aria-label="Close"
        >
          ×
        </button>

        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#05102D]/55">
          About
        </p>

        <h2 className="mb-4 font-serif text-5xl font-black leading-none tracking-[-0.05em] text-[#1D56CF]">
          Photo2y
        </h2>

        <p className="mb-4 text-sm font-bold leading-relaxed text-[#05102D]/80">
          Photo2y is a playful web-based photobooth app made for capturing moments,
          customizing photo strips, applying creative filters, and saving memories in a
          fun printable style.
        </p>

        <p className="mb-4 text-sm font-bold leading-relaxed text-[#05102D]/80">
          Feel free to take photos whenever and wherever you want. Hope y&apos;all
          capture great memories with Photo2y.
        </p>

        <p className="mb-5 text-sm font-bold leading-relaxed text-[#05102D]/80">
          If you have feedback or suggestions, feel free to drop me a message through my
          portfolio.
        </p>

        <a
          href="https://portfoliyooo.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex w-full items-center justify-center rounded-[22px] border-2 border-[#05102D] bg-[#1D56CF] px-5 py-3 text-sm font-black uppercase tracking-wide text-[#FDF9F2] transition-all duration-200 hover:-translate-y-1 hover:bg-[#1746A8] hover:shadow-[4px_5px_0_#05102D] active:translate-y-1 active:shadow-none"
        >
          Visit my portfolio →
        </a>

        <div className="rounded-[24px] border-2 border-dashed border-[#05102D]/30 bg-white/55 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D56CF]">
            Created by
          </p>

          <p className="mt-1 text-lg font-black text-[#05102D]">
            Michael Gonzales <span className="text-[#1D56CF]">(Chroma)</span>
          </p>
        </div>

        <style>{`
          @keyframes photo2yInfoPop {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(0.94) rotate(-1deg);
            }

            70% {
              opacity: 1;
              transform: translateY(-3px) scale(1.02) rotate(0.4deg);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1) rotate(0deg);
            }
          }

          .animate-photo2y-info-pop {
            animation: photo2yInfoPop 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        `}</style>
      </div>
    </div>
  );
}

export default Photo2yInfo;