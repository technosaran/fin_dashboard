interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function SkeletonLoader({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
}: SkeletonLoaderProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#0f172a',
        borderRadius: '20px',
        border: '1px solid #1e293b',
        padding: '24px',
      }}
    >
      <SkeletonLoader height="24px" width="60%" />
      <div style={{ marginTop: '16px' }}>
        <SkeletonLoader height="40px" width="40%" />
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <SkeletonLoader height="12px" width="30%" />
        <SkeletonLoader height="12px" width="30%" />
        <SkeletonLoader height="12px" width="30%" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '14px',
            gap: '16px',
          }}
        >
          <SkeletonLoader width="40px" height="40px" borderRadius="10px" />
          <div style={{ flex: 1 }}>
            <SkeletonLoader height="16px" width="60%" />
            <div style={{ marginTop: '8px' }}>
              <SkeletonLoader height="12px" width="40%" />
            </div>
          </div>
          <SkeletonLoader width="80px" height="20px" />
        </div>
      ))}
    </div>
  );
}
