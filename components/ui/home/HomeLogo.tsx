export default function HomeLogo({ width = 180, height = 81 }: { width?: number; height?: number }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logoInv.svg" alt="RCR Support" className="logo-light" style={{ width, height }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="RCR Support" className="logo-dark" style={{ width, height }} />
    </>
  );
}
