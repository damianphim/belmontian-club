import React, { useRef, useState, useCallback } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { a, useSpring } from '@react-spring/three';
import { Html, useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import JoinHeader from './JoinHeader';
import AboutHeader from './AboutHeader';
import OpportunitiesHeader from './OpportunitiesHeader';
import JoinPage from './JoinPage';
import AboutPage from './About';
import OpportunitiesPage from './Opportunities';

function Background({ pageIndex }) {
  const meshRefs = [useRef(), useRef(), useRef()];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const { gl } = useThree();

  const woodTexture = useLoader(THREE.TextureLoader, '/oak_veneer_01_diff_2k.jpg');
  
  function FrontFolder({ url, textureUrl }) {
    const originalFbx = useLoader(FBXLoader, url);
    const texture = useLoader(THREE.TextureLoader, textureUrl);
  
    const fbx = originalFbx.clone();
  
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
        });
        child.material.needsUpdate = true;
      }
    });
  
    fbx.position.set(0, 0, 0);  
    fbx.rotation.set(0, 0, 0);
    fbx.scale.set(0.05, 0.05, 0.05);
  
    return <primitive object={fbx} />;
  }
  
  function BackFolder({ url, textureUrl }) {
    const originalFbx = useLoader(FBXLoader, url);
    const texture = useLoader(THREE.TextureLoader, textureUrl);
  
    const fbx = originalFbx.clone();
  
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
        });
        child.material.needsUpdate = true;
      }
    });
  
    fbx.position.set(0, -0.5, -1);  
    fbx.rotation.set(0, 0, 0);
    fbx.scale.set(0.05, 0.05, 0.05);
  
    return <primitive object={fbx} />;
  }

  const headerComponents = [<OpportunitiesHeader />, <JoinHeader />, <AboutHeader />];
  const contentComponents = [<OpportunitiesPage />, <JoinPage />, <AboutPage />];

  const springs = [
    useSpring({
      position:
        focusedIndex === 0
          ? [0, 2, 0]
          : hoveredIndex === 0
          ? [0, 0, -1.8]
          : [0, 0, -1.4],
    }),
    useSpring({
      position:
        focusedIndex === 1
          ? [0, 2, 0]
          : hoveredIndex === 1
          ? [0, 0, -1.4]
          : [0, 0, -1],
    }),
    useSpring({
      position:
        focusedIndex === 2
          ? [0, 2, 0]
          : hoveredIndex === 2
          ? [0, 0, -1]
          : [0, 0, -0.6],
    }),
  ];

  const calculatePercentage = useCallback((clientY) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    const yPos = clientY - rect.top; 
    return (yPos / rect.height) * 100;
  }, [gl]);

  // Mouse movement interaction detection
  const checkMouseInteraction = useCallback((percentage) => {
    const zoneHeight = 100 / 3; 

    if (percentage < zoneHeight) {
      return 0; 
    } else if (percentage >= zoneHeight && percentage < 2 * zoneHeight) {
      return 1; 
    } else if (percentage >= 2 * zoneHeight) {
      return 2; 
    }
    return null;
  }, []);

  // Click interaction detection
  const checkClickInteraction = useCallback((percentage) => {
    const zoneHeight = 100 / 3;

    if (percentage < zoneHeight) {
      return 0; // Top page
    } else if (percentage >= zoneHeight && percentage < 2 * zoneHeight) {
      return 1; // Middle page
    } else if (percentage >= 2 * zoneHeight) {
      return 2; // Bottom page
    }
    return null;
  }, []);

  useFrame(({ mouse }) => {
    if (focusedIndex === null) {
      const clientY = (1 - mouse.y) * gl.domElement.clientHeight / 2;
      const percentage = calculatePercentage(clientY);
      const newHoveredIndex = checkMouseInteraction(percentage);

      if (newHoveredIndex !== hoveredIndex) {
        setHoveredIndex(newHoveredIndex);
      }
    }
  });

  const handlePageClick = useCallback((event) => {
    event.stopPropagation();
    const percentage = calculatePercentage(event.clientY);
    const clickedIndex = checkClickInteraction(percentage);

    if (clickedIndex !== null) {
      if (focusedIndex === null) {
        setFocusedIndex(clickedIndex);
      } else {
        setFocusedIndex(null);
        setHoveredIndex(null);
      }
    }
  }, [focusedIndex, checkClickInteraction, calculatePercentage]);

  const getOpacityHeader = (index) => {
    if (focusedIndex !== null) {
      return focusedIndex === index ? 1 : 0;
    }
    if (hoveredIndex === 2) {
      return index === 2 ? 1 : 0;
    } else if (hoveredIndex === 1) {
      return index >= 1 ? 1 : 0;
    } else if (hoveredIndex === 0) {
      return 1;
    } else {
      return 1;
    }
  };

  const getOpacityMain = (index) => {
    if (focusedIndex === null) {
      return 0;
    } else if (focusedIndex === index) {
      return 1;
    } else {
      return 0;
    }
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>

      {meshRefs.map((ref, index) => (
        <a.mesh
          ref={ref}
          key={`paper-${index}`}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          {...springs[index]}
          castShadow
          receiveShadow
          onClick={handlePageClick}
        >
          <planeGeometry args={[5, 7]} />
          <meshStandardMaterial color="#ffffff" />

          <lineSegments>
            <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(5, 7)]} />
            <lineBasicMaterial attach="material" color="black" />
          </lineSegments>

          <Html
            position={[2.1, -0.1, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            transform
            occlude={false}
            style={{
              opacity: getOpacityHeader(index),
              transition: 'opacity 0.2s ease-in-out',
            }}
            zIndexRange={[10, 0]}
          >
            <div style={{ pointerEvents: 'none', textAlign: 'left', fontSize: '0.4em', fontFamily: "'Georgia', sans-serif" }}>
              {headerComponents[index]}
            </div>
          </Html>

          <Html
            position={[0, 0, 0]}
            distanceFactor={12}
            rotation={[0, 0, -Math.PI / 2]}
            transform
            scale={[0.224, 0.224, 0.224]}
            style={{
              opacity: getOpacityMain(index),
              transition: 'opacity 0.2s ease-in-out',
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
            }}
            zIndexRange={[10, 0]}
          >
            <div style={{ pointerEvents: 'none' }}>
              {contentComponents[index]}
            </div>
          </Html>
        </a.mesh>
      ))}
      <FrontFolder url="./Folder.fbx" textureUrl="./DefaultMaterial_Base_Color.png" />
      <BackFolder url="./Folder.fbx" textureUrl="./DefaultMaterial_Base_Color.png" />
    </>
  );
}

export default Background;
