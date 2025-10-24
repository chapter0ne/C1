import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeJSPageCurlProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
  theme: 'morning' | 'evening' | 'midnight';
  enabled: boolean;
}

const ThreeJSPageCurl: React.FC<ThreeJSPageCurlProps> = ({
  children,
  onNext,
  onPrev,
  theme,
  enabled
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pageGeometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const pageMeshRef = useRef<THREE.Mesh | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [corner, setCorner] = useState<'right' | 'left' | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);

  const getThemeColors = () => {
    switch (theme) {
      case 'morning':
        return { bg: 0xFFFFFF, shadow: 0x000000, shadowOpacity: 0.3 };
      case 'evening':
        return { bg: 0xF5E6D3, shadow: 0x8B4513, shadowOpacity: 0.25 };
      case 'midnight':
        return { bg: 0x1A1A1A, shadow: 0x000000, shadowOpacity: 0.5 };
    }
  };

  const colors = getThemeColors();

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg);
    sceneRef.current = scene;

    // Create perspective camera for realistic 3D
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, 800);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create high-resolution page geometry (more segments = smoother curl)
    const segments = 60;
    const geometry = new THREE.PlaneGeometry(width * 0.9, height * 0.9, segments, segments);
    pageGeometryRef.current = geometry;

    // Store original positions for resetting
    originalPositionsRef.current = new Float32Array(geometry.attributes.position.array);

    // Create material with double-sided rendering
    const material = new THREE.MeshStandardMaterial({
      color: colors.bg,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pageMeshRef.current = mesh;
    scene.add(mesh);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Add directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(200, 200, 400);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Add point light at curl location for realistic shadow
    const curlLight = new THREE.PointLight(colors.shadow, colors.shadowOpacity, 400);
    curlLight.position.set(0, 0, 100);
    scene.add(curlLight);

    // Initial render
    renderer.render(scene, camera);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [theme]);

  // Apply realistic curl deformation with smooth gradient
  const applyCurl = useCallback((mouseX: number, mouseY: number, cornerType: 'right' | 'left') => {
    if (!pageGeometryRef.current || !pageMeshRef.current || !containerRef.current || !originalPositionsRef.current) return;

    const geometry = pageGeometryRef.current;
    const positions = geometry.attributes.position;
    const width = containerRef.current.clientWidth * 0.9;
    const height = containerRef.current.clientHeight * 0.9;

    // Calculate curl center point (mouse position)
    const curlX = (mouseX / containerRef.current.clientWidth - 0.5) * width;
    const curlY = -(mouseY / containerRef.current.clientHeight - 0.5) * height;

    // Update each vertex
    for (let i = 0; i < positions.count; i++) {
      const x = originalPositionsRef.current[i * 3];
      const y = originalPositionsRef.current[i * 3 + 1];
      
      // Calculate distance from vertex to curl point
      const dx = x - curlX;
      const dy = y - curlY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Curl radius based on drag distance
      const curlRadius = Math.max(100, distance * 0.5);
      
      // Calculate curl influence (smooth falloff)
      let influence = 0;
      
      if (cornerType === 'right') {
        // Curl from right edge
        const edgeDistance = (width / 2) - x;
        if (x > curlX && edgeDistance < curlRadius) {
          influence = 1 - (edgeDistance / curlRadius);
          influence = influence * influence; // Smooth falloff
        }
      } else {
        // Curl from left edge
        const edgeDistance = x - (-width / 2);
        if (x < curlX && edgeDistance < curlRadius) {
          influence = 1 - (edgeDistance / curlRadius);
          influence = influence * influence; // Smooth falloff
        }
      }

      // Apply curl transformation
      if (influence > 0) {
        const angle = influence * Math.PI * 0.7; // Max 126 degrees
        const radius = curlRadius * 0.3;
        
        // Calculate curved position
        const newZ = Math.sin(angle) * radius * influence;
        const offsetX = (1 - Math.cos(angle)) * radius * influence;
        
        positions.setXYZ(
          i,
          x + (cornerType === 'right' ? -offsetX : offsetX),
          y,
          newZ
        );
      } else {
        // Reset to original position
        positions.setXYZ(i, x, y, 0);
      }
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate normals for proper lighting
  }, []);

  // Reset curl to flat
  const resetCurl = useCallback(() => {
    if (!pageGeometryRef.current || !originalPositionsRef.current) return;

    const geometry = pageGeometryRef.current;
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(
        i,
        originalPositionsRef.current[i * 3],
        originalPositionsRef.current[i * 3 + 1],
        0
      );
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }, []);

  // Animation loop - render continuously while dragging
  useEffect(() => {
    if (!isDragging) {
      setShowCanvas(false);
      resetCurl();
      return;
    }

    setShowCanvas(true);

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      if (corner) {
        applyCurl(dragCurrent.x, dragCurrent.y, corner);
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, dragCurrent, corner, applyCurl, resetCurl]);

  const handleStart = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cornerZone = 120;
    
    if (x > rect.width - cornerZone) {
      setCorner('right');
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      setIsDragging(true);
    } else if (x < cornerZone) {
      setCorner('left');
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      setIsDragging(true);
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDragCurrent({ x, y });
  };

  const handleEnd = () => {
    if (!isDragging || !corner) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dragDistance = Math.abs(dragCurrent.x - dragStart.x);
    const threshold = rect.width * 0.25;

    if (dragDistance > threshold) {
      // Complete flip
      setTimeout(() => {
        if (corner === 'right') {
          onNext();
        } else {
          onPrev();
        }
      }, 200);
    }

    setIsDragging(false);
    setCorner(null);
  };

  // Early return AFTER all hooks
  if (!enabled) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ touchAction: 'none' }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
    >
      {/* Hidden content for rendering */}
      <div
        ref={contentRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0, visibility: 'hidden' }}
      >
        {children}
      </div>

      {/* Three.js canvas - only visible during drag */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ 
          display: showCanvas ? 'block' : 'none',
          cursor: 'grabbing'
        }}
      />

      {/* Actual EPUB content - visible when not dragging */}
      <div
        className="absolute inset-0"
        style={{ display: showCanvas ? 'none' : 'block' }}
      >
        {children}
      </div>

      {/* Corner grab indicators */}
      {!isDragging && (
        <>
          <div 
            className="absolute top-0 right-0 w-24 h-24 cursor-grab opacity-0 hover:opacity-10 transition-opacity"
            style={{
              background: 'radial-gradient(circle at top right, rgba(128,128,128,0.3), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div 
            className="absolute bottom-0 right-0 w-24 h-24 cursor-grab opacity-0 hover:opacity-10 transition-opacity"
            style={{
              background: 'radial-gradient(circle at bottom right, rgba(128,128,128,0.3), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div 
            className="absolute top-0 left-0 w-24 h-24 cursor-grab opacity-0 hover:opacity-10 transition-opacity"
            style={{
              background: 'radial-gradient(circle at top left, rgba(128,128,128,0.3), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-24 h-24 cursor-grab opacity-0 hover:opacity-10 transition-opacity"
            style={{
              background: 'radial-gradient(circle at bottom left, rgba(128,128,128,0.3), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
        </>
      )}
    </div>
  );
};

export default ThreeJSPageCurl;
