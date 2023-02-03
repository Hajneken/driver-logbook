import React from "react";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

export default function CameraOverlay() {
  return (
    <Svg
      style={{ position: "absolute", left: 0, top: 0 }}
      height="100%"
      width="100%"
    >
      <Defs>
        <Mask id="mask" x="0" y="0" height="100%" width="100%">
          <Rect x="0%" y="0%" height="25%" width="100%" fill="#fff" />
          <Rect x="0%" y="37%" height="63%" width="100%" fill="#fff" />
          <Rect x="0%" y="24%" height="14%" width="25%" fill="#fff" />
          <Rect x="75%" y="24%" height="14%" width="25%" fill="#fff" />
        </Mask>
      </Defs>
      <Rect
        x="0"
        y="0"
        height="100%"
        width="100%"
        mask="url(#mask)"
        fill="rgba(0, 0, 0, 0.65)"
      />
    </Svg>
  );
}
