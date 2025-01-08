import NextImage, { ImageProps } from 'next/image';

const Image = ({ ...rest }: ImageProps) => (
  <NextImage suppressHydrationWarning {...rest} />
);

export default Image;
