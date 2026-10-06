import React, { useEffect } from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react';
import './Counter.css';

interface NumberProps {
  key?: React.Key;
  mv: MotionValue<number>;
  number: number;
  height: number;
}

function Number({ mv, number, height }: NumberProps) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });
  return (
    <motion.span className="counter-number" style={{ y }}>
      {number}
    </motion.span>
  );
}

function normalizeNearInteger(num: number): number {
  const nearest = Math.round(num);
  const tolerance = 1e-9 * Math.max(1, Math.abs(num));
  return Math.abs(num - nearest) < tolerance ? nearest : num;
}

function getValueRoundedToPlace(value: number, place: number): number {
  const scaled = value / place;
  return Math.floor(normalizeNearInteger(scaled));
}

interface DigitProps {
  key?: React.Key;
  place: number | string;
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
}

function Digit({ place, value, height, digitStyle }: DigitProps) {
  const isDecimal = place === '.';
  const numericPlace = typeof place === 'number' ? place : 1;
  const valueRoundedToPlace = isDecimal ? 0 : getValueRoundedToPlace(value, numericPlace);
  
  // Track mount state so newly created higher places (e.g. tens digit appearing on 10) roll from 0
  const isFirstMountRef = React.useRef(true);
  const initialSpring = isFirstMountRef.current && numericPlace > 1 ? 0 : valueRoundedToPlace;

  const animatedValue = useSpring(initialSpring, {
    stiffness: 260,
    damping: 28,
    mass: 0.8,
  });

  useEffect(() => {
    isFirstMountRef.current = false;
    if (!isDecimal) {
      animatedValue.set(valueRoundedToPlace);
    }
  }, [animatedValue, valueRoundedToPlace, isDecimal]);

  if (isDecimal) {
    return (
      <span className="counter-digit" style={{ height, ...digitStyle, width: 'fit-content' }}>
        .
      </span>
    );
  }

  return (
    <span className="counter-digit" style={{ height, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

export interface CounterProps {
  value: number;
  fontSize?: number;
  padding?: number;
  places?: (number | string)[];
  gap?: number;
  borderRadius?: number;
  horizontalPadding?: number;
  textColor?: string;
  fontWeight?: string | number;
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  topGradientStyle?: React.CSSProperties;
  bottomGradientStyle?: React.CSSProperties;
}

export default function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places,
  gap = 2,
  borderRadius = 4,
  horizontalPadding = 0,
  textColor = 'inherit',
  fontWeight = 'inherit',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 12,
  gradientFrom = 'transparent',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle,
}: CounterProps) {
  // Default places: auto-detect from integer value (or decimal if present)
  const computedPlaces = places || (() => {
    const str = Math.abs(value).toString();
    const hasDot = str.includes('.');
    if (!hasDot) {
      return [...str].map((_, i, a) => 10 ** (a.length - i - 1));
    }
    const dotIdx = str.indexOf('.');
    return [...str].map((ch, i) => {
      if (ch === '.') return '.';
      return i < dotIdx ? 10 ** (dotIdx - i - 1) : 10 ** -(i - dotIdx);
    });
  })();

  const height = fontSize + padding;
  const defaultCounterStyle: React.CSSProperties = {
    fontSize,
    gap: gap,
    borderRadius: borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    color: textColor,
    fontWeight: fontWeight,
    direction: 'ltr',
  };
  const defaultTopGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
  };
  const defaultBottomGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
  };

  return (
    <span className="counter-container" style={containerStyle}>
      <span className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
        {computedPlaces.map((place) => (
          <Digit key={`place-${place}`} place={place} value={value} height={height} digitStyle={digitStyle} />
        ))}
      </span>
      {gradientFrom !== 'transparent' && (
        <span className="gradient-container">
          <span className="top-gradient" style={topGradientStyle || defaultTopGradientStyle}></span>
          <span
            className="bottom-gradient"
            style={bottomGradientStyle || defaultBottomGradientStyle}
          ></span>
        </span>
      )}
    </span>
  );
}
