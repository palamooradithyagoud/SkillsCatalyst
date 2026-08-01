export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface AnimatedIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function scaledStrokeWidth(strokeWidth: number, viewBoxSize: number = 24): number {
  return (strokeWidth * viewBoxSize) / 24;
}
