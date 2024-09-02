import React from 'react';
import { Canvas } from '@react-three/fiber';
import Background from './components/Background';
import './App.css';
import './styles.css';

function App() {

  return (
    <div className="App">
      <Canvas shadows camera={{ position: [0, 10, 0], rotation: [-Math.PI / 2, 0, 0], fov: 50 }}>
        <Background />
      </Canvas>
    </div>
  );
}

export default App;
