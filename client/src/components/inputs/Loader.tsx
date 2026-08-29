import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'avatar' | 'button' | 'card' | 'table' | 'input';
  width?: string;
  height?: string;
}

export const SkeletonLoader = ({
  type,
  width,
  height,
}: SkeletonLoaderProps) => {
  const style = {
    width:
      width ||
      `${type === `text` ? `${Math.floor(Math.random() * 6 + 10)}vw` : 100}%`,
    height: height || `${type === 'input' ? '2.3rem' : '1.75rem'}`,
    animationDuration: '1.4s',
  };

  switch (type) {
    case 'text':
      style.width = width || `${Math.floor(Math.random() * 6 + 10)}vw`;
      style.height = height || `1.5rem`;
      break;
    case 'input':
      style.height = height || '2.3rem';
      break;
    case 'button':
      style.height = height || '2.3rem';
      break;
  }

  return (
    <figure
      className={`animate-pulse bg-(--surface) rounded-[4px]`}
      style={style}
    />
  );
};

export const FormSkeletonLoader = () => {
  return (
    <fieldset className="w-full grid grid-cols-2 gap-6 p-6">
      {Array.from({ length: 10 }).map((_, index) => (
        <label className="w-full flex flex-col gap-2" key={index}>
          <SkeletonLoader type="text" />
          <SkeletonLoader type="input" height="2rem" />
        </label>
      ))}
    </fieldset>
  );
};
