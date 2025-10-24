import React, { useRef, useEffect, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

// Vertex shader for page curl deformation
const vertexShaderSource = `
  attribute vec3 position;
  attribute vec2 uv;
  
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform vec2 curlPosition;
  uniform float curlRadius;
  uniform float curlAngle;
  uniform vec2 resolution;
  
  varying vec2 vUv;
  varying float vCurlAmount;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  #define PI 3.14159265359
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Calculate distance from curl position
    vec2 posXY = pos.xy;
    vec2 curlDir = normalize(curlPosition - posXY);
    float distToCurl = distance(posXY, curlPosition);
    
    // Apply curl deformation
    if (distToCurl < curlRadius) {
      float curlFactor = 1.0 - (distToCurl / curlRadius);
      curlFactor = smoothstep(0.0, 1.0, curlFactor); // Smooth falloff
      
      // Bend the page in 3D space
      float angle = curlAngle * curlFactor;
      float bendRadius = curlRadius * 0.3;
      
      // Calculate curl arc
      float arcLength = angle;
      float newZ = sin(arcLength) * bendRadius;
      float offsetX = (1.0 - cos(arcLength)) * bendRadius;
      
      // Apply deformation
      pos.z += newZ * curlFactor;
      pos.x += offsetX * curlDir.x * curlFactor;
      pos.y += offsetX * curlDir.y * curlFactor;
      
      vCurlAmount = curlFactor;
      
      // Calculate normal for lighting
      vec3 tangent = vec3(cos(arcLength), 0.0, -sin(arcLength));
      vNormal = normalize(cross(tangent, vec3(0.0, 1.0, 0.0)));
    } else {
      vCurlAmount = 0.0;
      vNormal = vec3(0.0, 0.0, 1.0);
    }
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader for lighting and shadows
const fragmentShaderSource = `
  precision highp float;
  
  uniform sampler2D pageTexture;
  uniform vec2 curlPosition;
  uniform float curlRadius;
  uniform vec3 lightPosition;
  uniform vec3 ambientColor;
  uniform vec3 diffuseColor;
  uniform float shadowIntensity;
  uniform bool isBackFace;
  
  varying vec2 vUv;
  varying float vCurlAmount;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Sample the page texture
    vec4 texColor = texture2D(pageTexture, vUv);
    
    // Calculate lighting
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    
    // Diffuse lighting
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;
    
    // Ambient lighting
    vec3 ambient = ambientColor;
    
    // Combine lighting
    vec3 lighting = ambient + diffuse;
    
    // Apply shadow in curled area
    float shadow = 1.0 - (vCurlAmount * shadowIntensity);
    lighting *= shadow;
    
    // Apply lighting to texture
    vec3 finalColor = texColor.rgb * lighting;
    
    // Darken back face
    if (isBackFace) {
      finalColor *= 0.7;
    }
    
    // Add subtle gradient shadow along curl edge
    float edgeShadow = smoothstep(curlRadius * 0.8, curlRadius, distance(vPosition.xy, curlPosition));
    finalColor *= mix(0.6, 1.0, edgeShadow);
    
    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

interface WebGLPageCurlProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
  theme: 'morning' | 'evening' | 'midnight';
  enabled: boolean;
}

const WebGLPageCurl: React.FC<WebGLPageCurlProps> = ({
  children,
  onNext,
  onPrev,
  theme,
  enabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [curlPosition, setCurlPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [corner, setCorner] = useState<'right' | 'left' | null>(null);
  
  const animationFrameRef = useRef<number | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());

  const getThemeColors = () => {
    switch (theme) {
      case 'morning':
        return { ambient: [0.8, 0.8, 0.8], diffuse: [1.0, 1.0, 1.0], shadow: 0.4 };
      case 'evening':
        return { ambient: [0.9, 0.85, 0.75], diffuse: [1.0, 0.95, 0.85], shadow: 0.35 };
      case 'midnight':
        return { ambient: [0.2, 0.2, 0.2], diffuse: [0.4, 0.4, 0.4], shadow: 0.5 };
    }
  };

  // Compile shader
  const compileShader = (gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  // Initialize WebGL
  useEffect(() => {
    if (!canvasRef.current || !enabled) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: true
    });
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Compile shaders
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) {
      console.error('Failed to compile shaders');
      return;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Create page geometry (high-resolution grid)
    const segments = 60;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= segments; y++) {
      for (let x = 0; x <= segments; x++) {
        const u = x / segments;
        const v = y / segments;
        
        // Position in normalized device coordinates
        const px = (u - 0.5) * 2;
        const py = (v - 0.5) * 2;
        
        vertices.push(px, py, 0);
        uvs.push(u, v);
        
        // Create triangles
        if (x < segments && y < segments) {
          const a = y * (segments + 1) + x;
          const b = a + 1;
          const c = a + segments + 1;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    }

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Get attribute locations
    const positionLocation = gl.getAttribLocation(program, 'position');
    const uvLocation = gl.getAttribLocation(program, 'uv');

    // Enable attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    // Create texture for page content
    const texture = gl.createTexture();
    textureRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initial render
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(uvBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteTexture(texture);
    };
  }, [enabled, theme]);

  // Capture content as texture using html2canvas
  const updateTexture = useCallback(async () => {
    if (!glRef.current || !textureRef.current || !contentRef.current) return;

    const gl = glRef.current;
    
    try {
      // Capture the content div as canvas
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: theme === 'morning' ? '#FFFFFF' : theme === 'evening' ? '#F5E6D3' : '#1A1A1A',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Upload canvas to WebGL texture
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    } catch (error) {
      console.error('Failed to capture content as texture:', error);
      
      // Fallback to solid color
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1024;
      fallbackCanvas.height = 1024;
      const ctx = fallbackCanvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = theme === 'morning' ? '#FFFFFF' : theme === 'evening' ? '#F5E6D3' : '#1A1A1A';
        ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
        
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fallbackCanvas);
      }
    }
  }, [theme]);

  // Render loop
  const render = useCallback(() => {
    if (!glRef.current || !programRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;
    const colors = getThemeColors();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set uniforms
    const curlPosLocation = gl.getUniformLocation(program, 'curlPosition');
    const curlRadiusLocation = gl.getUniformLocation(program, 'curlRadius');
    const curlAngleLocation = gl.getUniformLocation(program, 'curlAngle');
    const lightPosLocation = gl.getUniformLocation(program, 'lightPosition');
    const ambientColorLocation = gl.getUniformLocation(program, 'ambientColor');
    const diffuseColorLocation = gl.getUniformLocation(program, 'diffuseColor');
    const shadowIntensityLocation = gl.getUniformLocation(program, 'shadowIntensity');

    if (isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const normalizedX = (curlPosition.x / rect.width) * 2 - 1;
      const normalizedY = 1 - (curlPosition.y / rect.height) * 2;

      gl.uniform2f(curlPosLocation, normalizedX, normalizedY);
      gl.uniform1f(curlRadiusLocation, 0.8);
      gl.uniform1f(curlAngleLocation, Math.PI * 0.5);
    } else {
      gl.uniform2f(curlPosLocation, 0, 0);
      gl.uniform1f(curlRadiusLocation, 0.0);
      gl.uniform1f(curlAngleLocation, 0.0);
    }

    gl.uniform3f(lightPosLocation, 0.5, 0.5, 1.0);
    gl.uniform3f(ambientColorLocation, ...colors.ambient);
    gl.uniform3f(diffuseColorLocation, ...colors.diffuse);
    gl.uniform1f(shadowIntensityLocation, colors.shadow);

    // Draw
    const segments = 60;
    const indexCount = segments * segments * 6;
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [isDragging, curlPosition, theme]);

  useEffect(() => {
    updateTexture();
    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateTexture, render]);

  // Touch handlers
  const handleStart = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cornerZone = 150;

    if (x > rect.width - cornerZone) {
      setCorner('right');
      setDragStart({ x, y });
      setCurlPosition({ x, y });
      setIsDragging(true);
      lastPosRef.current = { x, y };
      lastTimeRef.current = Date.now();
    } else if (x < cornerZone) {
      setCorner('left');
      setDragStart({ x, y });
      setCurlPosition({ x, y });
      setIsDragging(true);
      lastPosRef.current = { x, y };
      lastTimeRef.current = Date.now();
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate velocity
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000;
    velocityRef.current = {
      x: (x - lastPosRef.current.x) / dt,
      y: (y - lastPosRef.current.y) / dt
    };

    lastPosRef.current = { x, y };
    lastTimeRef.current = now;

    setCurlPosition({ x, y });
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dragDistance = Math.abs(curlPosition.x - dragStart.x);
    const threshold = rect.width * 0.3;
    const velocity = Math.abs(velocityRef.current.x);

    if (dragDistance > threshold || velocity > 500) {
      if (corner === 'right') {
        onNext();
      } else {
        onPrev();
      }
    }

    setIsDragging(false);
    setCorner(null);
  };

  if (!enabled) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Hidden content for texture capture */}
      <div
        ref={contentRef}
        className="absolute inset-0"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        {children}
      </div>

      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        width={1024}
        height={1024}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
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
      />

      {/* Actual content (visible when not dragging) */}
      {!isDragging && (
        <div className="absolute inset-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default WebGLPageCurl;

