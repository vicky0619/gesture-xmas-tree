# Gesture Interactive Christmas Tree

A premium 3D particle experience controlled by hand gestures. Built with React, Three.js, and MediaPipe.
Demo: https://gesture-xmas-tree.vercel.app/

## Features
- **3D Particle System**: Thousands of gold, red, and emerald particles.
- **Gesture Control**:
  - **Open Palm**: Explode particles into a cosmic nebula.
  - **Fist**: Form a glowing Christmas Tree with a spinning star.
- **Premium Visuals**: Unreal Bloom effects, cinematic camera, and elegant typography.

## Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Go to `http://localhost:5173` (or the URL shown in terminal).

## How to Use
1.  Allow Camera permissions when prompted.
2.  Hold your hand in front of the camera (visible in the bottom-left monitor).
3.  **Make a Fist** to build the Tree.
4.  **Open your Hand** to explode the particles.

## Troubleshooting
- Ensure good lighting for hand detection.
- If the browser blocks the camera, check the address bar for permission settings.
- Requires a GPU-enabled device for smooth 3D performance.
