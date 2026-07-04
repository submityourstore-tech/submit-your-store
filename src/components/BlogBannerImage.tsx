type BlogBannerImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** Native img — Next/Image does not support /api/ banner routes. */
export function BlogBannerImage({ src, alt, className = "", priority }: BlogBannerImageProps) {
  return (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src}
    alt={alt}
    className={className}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
  />
  );
}
