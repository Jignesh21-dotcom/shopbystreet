import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function BackgroundIllustration() {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Rect width={width} height={height} fill="transparent" />

      <Path
        d={`M0 ${height * 0.7} Q${width * 0.3} ${height * 0.6}, ${width * 0.5} ${height * 0.7} Q${width * 0.8} ${height * 0.8}, ${width} ${height * 0.7} L${width} ${height} L0 ${height} Z`}
        fill="#fff"
        opacity={0.1}
      />

      <Path
        d={`M0 ${height * 0.75} Q${width * 0.25} ${height * 0.65}, ${width * 0.5} ${height * 0.75} Q${width * 0.75} ${height * 0.85}, ${width} ${height * 0.75} L${width} ${height} L0 ${height} Z`}
        fill="#fff"
        opacity={0.15}
      />
    </Svg>
  );
}
