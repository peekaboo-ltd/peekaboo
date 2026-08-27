interface ImageSlotProps {
  label: string;
  dark?: boolean;
  className?: string;
}

const ImageSlot = ({ label, dark = false, className = '' }: ImageSlotProps) => (
  <figure
    className={[
      'flex items-center justify-center rounded-(--radius-card) border border-dashed text-center text-[10px]',
      dark
        ? 'border-(--line) bg-(--surface) text-(--muted)'
        : 'border-(--line) bg-(--surface) text-(--muted)',
      className,
    ].join(' ')}
  >
    <span>{label}</span>
  </figure>
);

export default ImageSlot;
