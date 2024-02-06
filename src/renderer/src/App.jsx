/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import Game from './components/Game'
import Controls from './components/Controls'
import { proxy } from 'valtio'
import HUD from './components/HUD'
import Screenshot from './components/Screenshot'
import { KeyboardControls } from '@react-three/drei'
import { useControls } from 'leva'

// Reactive state model, using Valtio ...
const modes = ['translate', 'rotate', 'scale']
const state = proxy({ current: null, mode: 1 })

function App() {
  const canvasRef = useRef()

  const { BGColor } = useControls('Scene', {
    BGColor: {
      label: 'BG Color',
      value: '#222'
    }
  })

  return (
    <div style={{ backgroundColor: BGColor, width: '100vw', height: '100vh' }}>
      <KeyboardControls map={[{ name: 'screenshot', keys: ['Space'] }]}>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 1, 1.6] }}
          gl={{ preserveDrawingBuffer: true }}
          shadows
        >
          <hemisphereLight
            color="#ffffff"
            groundColor="#b9b9b9"
            position={[-7, 25, 13]}
            intensity={0.85}
          />
          <spotLight intensity={10} position={[0, 10, 0]} castShadow />
          <Suspense>
            <Game state={state} modes={modes} canvasRef={canvasRef} />
          </Suspense>
          <Controls state={state} modes={modes} />
          <Screenshot />
        </Canvas>
        <HUD state={state} />
      </KeyboardControls>
    </div>
  )
}

export default App
