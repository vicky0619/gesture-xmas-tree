import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

const GestureController = ({ onGestureChange }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState("Initializing Legacy AI...");
    const lastGestureRef = useRef('IDLE');
    const lastGestureTimeRef = useRef(0);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!videoElement || !canvasElement) return;

        const ctx = canvasElement.getContext('2d');

        // 1. Setup Hands
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
            // Draw
            ctx.save();
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                    drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });

                    // Detect Gesture
                    detectGesture(landmarks);
                }
            }
            if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
                // setStatus("No Hands Detected");
            }
            ctx.restore();
        });

        // 2. Setup Camera
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 320,
            height: 240
        });

        setStatus("Starting Camera...");
        camera.start()
            .then(() => setStatus("Camera Active. Looking for hands..."))
            .catch(err => setStatus("Camera Error: " + err.message));

        return () => {
            // Cleanup if possible? Camera utils doesn't have stop() easily exposed sometimes
            // But React unmount usually kills the video element ref.
        };

    }, []);

    const detectGesture = (landmarks) => {
        const wrist = landmarks[0];

        const isFingerOpen = (tipIdx, pipIdx) => {
            const tip = landmarks[tipIdx];
            const pip = landmarks[pipIdx];
            const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
            const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
            return dTip > dPip;
        }

        const openFingers = [
            isFingerOpen(4, 2), // Thumb
            isFingerOpen(8, 5),
            isFingerOpen(12, 9),
            isFingerOpen(16, 13),
            isFingerOpen(20, 17)
        ].filter(Boolean).length;

        let currentGesture = 'IDLE';
        if (openFingers >= 4) currentGesture = 'OPEN';
        else if (openFingers <= 1) currentGesture = 'FIST';

        // Debounce
        if (currentGesture === lastGestureRef.current) {
            if (Date.now() - lastGestureTimeRef.current > 300) {
                onGestureChange(currentGesture);
                setStatus(`Gesture: ${currentGesture}`);
            }
        } else {
            lastGestureRef.current = currentGesture;
            lastGestureTimeRef.current = Date.now();
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '200px',
            height: '150px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 215, 0, 0.5)', // Gold
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            backgroundColor: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(10px)'
        }}>
            {/* Video hidden, Canvas shows the processed output */}
            <video
                ref={videoRef}
                style={{ display: 'none' }}
                movesInline
                playsInline
            />
            <canvas
                ref={canvasRef}
                width={320}
                height={240}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'scaleX(-1)'
                }}
            />

            <div style={{
                position: 'absolute', bottom: 5, left: 5,
                color: '#00FF00', fontSize: '10px',
                fontWeight: 'bold', textShadow: '1px 1px 0 #000'
            }}>
                {status}
            </div>
        </div>
    );
};

export default GestureController;
