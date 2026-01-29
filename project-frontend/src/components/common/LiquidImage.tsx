import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Shader Definition ---
const LiquidMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uHover: 0,
        uTime: 0,
        uIntensity: 0.4, // Strength of distortion
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform sampler2D uTexture;
    uniform float uHover;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    // Simplex noise function (or simple sine wave approximation for fluid)
    // Using a simple sine combination for "watery" ripples
    void main() {
      vec2 uv = vUv;
      
      // Create a wave effect based on hover
      float wave = sin(uv.y * 10.0 + uTime) * 0.005 + 
                   sin(uv.x * 10.0 + uTime * 0.5) * 0.005;
                   
      // Apply distortion only when hovering
      // We displace the UV coordinates based on noise/wave
      float disp = wave * uHover * uIntensity;
      
      // Distort UVs
      vec2 distortedUv = uv + vec2(disp, disp);
      
      // Fetch texture color
      vec4 color = texture2D(uTexture, distortedUv);
      
      gl_FragColor = color;
    }
  `
);

// Extend R3F with our custom material
extend({ LiquidMaterial });

// Add types for the custom material
declare global {
    namespace JSX {
        interface IntrinsicElements {
            liquidMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof LiquidMaterial> & {
                uTexture?: THREE.Texture;
                uHover?: number;
                uTime?: number;
                uIntensity?: number;
            };
        }
    }
}

const Scene = ({ src, isHovered }: { src: string; isHovered: boolean }) => {
    const materialRef = useRef<any>(null);
    const texture = useTexture(src);

    // Fix texture aspect ratio to cover like CSS 'object-cover'
    // Simplified here: we assume plane fits canvas, and we rely on texture stretching
    // For production 'object-cover' in WebGL, we'd calculate aspect ratios. 
    // For now, we'll let it stretch or map 1:1. 
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    useFrame((state, delta) => {
        if (materialRef.current) {
            // Smoothly interpolate hover value
            materialRef.current.uHover = THREE.MathUtils.lerp(
                materialRef.current.uHover,
                isHovered ? 1 : 0,
                delta * 2.5 // Speed of transition
            );
            // Continuous time for ripples
            materialRef.current.uTime += delta;
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2, 16, 16]} />
            {/* Plane fills the clip space (-1 to 1) if we use standard camera or viewport match */}
            <liquidMaterial ref={materialRef} uTexture={texture} transparent />
        </mesh>
    );
};

interface LiquidImageProps {
    src: string;
    alt?: string;
    className?: string; // CSS standard class
    containerClassName?: string; // Wrapper class
    parentHovered?: boolean; // Trigger from parent
}

const LiquidImage = ({ src, className, parentHovered }: LiquidImageProps) => {
    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* 
        We use resize={{ scroll: false }} and offset sizes to ensure it fits.
        The camera='orthographic' covering -1 to 1 is easiest for a 2D image plane.
      */}
            <Canvas camera={{ position: [0, 0, 1], zoom: 1 }} resize={{ scroll: false }}>
                <Scene src={src} isHovered={!!parentHovered} />
            </Canvas>
            {/* Fallback / SEO Image (Hidden but accessible) */}
            <img src={src} className="opacity-0 absolute inset-0 w-full h-full pointer-events-none" alt="" />
        </div>
    );
};

export default LiquidImage;
