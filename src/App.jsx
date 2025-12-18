import React, { useState } from 'react'
import './App.css'
import Experience from './components/Experience'
import GestureController from './components/GestureController'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [started, setStarted] = useState(false)
  const [gestureState, setGestureState] = useState('IDLE')

  return (
    // DEBUG: Changed background to DARK BLUE to verify App is rendering
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000033' }}>

      {/* Always visible DEBUG TEXT */}
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 99999, color: 'lime', padding: '10px' }}>
        APP MODE: {started ? "STARTED" : "WAITING"}
      </div>

      {!started && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'black', zIndex: 20
        }}>
          <h1 className="text-gold font-premium" style={{ fontSize: '3rem', marginBottom: '2rem' }}>MERRY CHRISTMAS</h1>
          <button onClick={() => setStarted(true)} style={{ fontSize: '1.5rem', color: '#FF0000', borderColor: '#FF0000' }}>
            Start Experience
          </button>
        </div>
      )}

      {started && (
        <ErrorBoundary>
          {/* 3D Scene - Rendered FIRST (Bottom Layer) */}
          <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
            <Experience gestureState={gestureState} />
          </div>

          {/* Gesture Controller - Rendered AFTER (Top Layer) */}
          <div style={{
            position: 'absolute',
            bottom: '50px',
            left: '50px',
            zIndex: 9999,
            width: '200px', height: '150px'
          }}>
            <GestureController onGestureChange={setGestureState} />
          </div>

          {/* UI Overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: '20px', width: '100%', textAlign: 'center' }}>
              <h1 className="text-gold font-premium">MERRY CHRISTMAS</h1>
            </div>

            {/* Status Indicators */}
            <div style={{ position: 'absolute', bottom: '150px', left: '20px', display: 'flex', gap: '20px' }}>
              <div style={{
                padding: '10px', border: '1px solid #333', borderRadius: '8px',
                color: gestureState === 'OPEN' ? '#FFD700' : '#444',
                boxShadow: gestureState === 'OPEN' ? '0 0 15px #FFD700' : 'none',
                transition: 'all 0.3s'
              }}>
                EXPLODE
              </div>
              <div style={{
                padding: '10px', border: '1px solid #333', borderRadius: '8px',
                color: gestureState === 'FIST' ? '#50C878' : '#444',
                boxShadow: gestureState === 'FIST' ? '0 0 15px #50C878' : 'none',
                transform: gestureState === 'FIST' ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.3s'
              }}>
                TREE
              </div>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </div>
  )
}

export default App
