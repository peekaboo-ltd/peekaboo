interface ImageSlotProps {
  label: string;
  dark?: boolean;
  className?: string;
}

const ImageSlot = ({ label, dark = false, className = '' }: ImageSlotProps) => (
  <figure
    className={[
      'flex items-center justify-center rounded-xl border border-dashed text-center font-mono text-[10px] uppercase',
      dark
        ? 'border-white/20 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_8px)] text-white/45'
        : 'border-[#d9d8d4] bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.035)_0px,rgba(0,0,0,0.035)_1px,transparent_1px,transparent_8px)] text-[#6b6f76]',
      className,
    ].join(' ')}
  >
    <span>{label}</span>
  </figure>
);

export default ImageSlot;
