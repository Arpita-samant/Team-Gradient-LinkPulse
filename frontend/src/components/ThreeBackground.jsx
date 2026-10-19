import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ theme = 'dark' }) {
  const containerRef = useRef(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if motion should be dampened (instead of disabling WebGL entirely)
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer, scene, camera, animationFrameId;
    let chainGroup, linkMesh1, linkMesh2, innerMesh1, innerMesh2, orbitalRing;
    let particles, originalPositions;
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollY = 0;

    try {
      // 1. Scene, Camera, Renderer
      scene = new THREE.Scene();
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 22);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.position = 'fixed';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100vw';
      renderer.domElement.style.height = '100vh';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.zIndex = '0';

      container.appendChild(renderer.domElement);

      const isDark = theme === 'dark';

      // 2. Lighting Setup for rich 3D shading
      const ambientLight = new THREE.AmbientLight(isDark ? 0x333333 : 0x888888, 1.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(isDark ? 0xffffff : 0x222222, 1.5);
      dirLight.position.set(10, 15, 20);
      scene.add(dirLight);

      const redPointLight = new THREE.PointLight(0xD71921, 2.5, 30);
      redPointLight.position.set(0, 0, 8);
      scene.add(redPointLight);

      // 3. Chain Assembly Group
      chainGroup = new THREE.Group();

      // Desktop layout: place on right side; mobile: center
      const updateGroupPosition = () => {
        if (window.innerWidth >= 1024) {
          chainGroup.position.set(4.5, 0.5, 0);
          chainGroup.scale.set(1.15, 1.15, 1.15);
        } else if (window.innerWidth >= 768) {
          chainGroup.position.set(2.5, 0, 0);
          chainGroup.scale.set(0.95, 0.95, 0.95);
        } else {
          chainGroup.position.set(0, 0.5, 0);
          chainGroup.scale.set(0.8, 0.8, 0.8);
        }
      };
      updateGroupPosition();

      // =========================================================================
      // 4D TESSERACT (HYPERCUBE) MATHEMATICS & PROJECTION
      // 16 Vertices (±1, ±1, ±1, ±1), 32 Edges connecting vertices differing by 1 bit
      // Rotates continuously in 4D (ZW, XW, YW planes) & projects dynamically to 3D
      // =========================================================================

      // 1. Generate 16 4D Vertices of hypercube
      const vertices4D = [];
      for (let i = 0; i < 16; i++) {
        vertices4D.push([
          (i & 1 ? 1 : -1) * 2.2,
          (i & 2 ? 1 : -1) * 2.2,
          (i & 4 ? 1 : -1) * 2.2,
          (i & 8 ? 1 : -1) * 2.2,
        ]);
      }

      // 2. Generate 32 Edges (connect vertices differing by hamming distance 1)
      const edges4D = [];
      for (let i = 0; i < 16; i++) {
        for (let bit = 0; bit < 4; bit++) {
          const j = i ^ (1 << bit);
          if (i < j) {
            edges4D.push([i, j]);
          }
        }
      }

      // 4D Rotation Function
      const rotate4D = (point, angleZW, angleXW, angleYW) => {
        let [x, y, z, w] = point;

        // Rotation in ZW plane
        const cosZW = Math.cos(angleZW);
        const sinZW = Math.sin(angleZW);
        const z1 = z * cosZW - w * sinZW;
        const w1 = z * sinZW + w * cosZW;
        z = z1;
        w = w1;

        // Rotation in XW plane
        const cosXW = Math.cos(angleXW);
        const sinXW = Math.sin(angleXW);
        const x2 = x * cosXW - w * sinXW;
        const w2 = x * sinXW + w * cosXW;
        x = x2;
        w = w2;

        // Rotation in YW plane
        const cosYW = Math.cos(angleYW);
        const sinYW = Math.sin(angleYW);
        const y3 = y * cosYW - w * sinYW;
        const w3 = y * sinYW + w * cosYW;
        y = y3;
        w = w3;

        // Stereographic / Perspective Projection from 4D to 3D
        // Camera distance in 4D space
        const distance4D = 4.8;
        const scale = distance4D / (distance4D - w);
        return new THREE.Vector3(x * scale, y * scale, z * scale);
      };

      // 3. Three.js Geometries for Pure Tesseract / 4-Cube (Wikipedia Schlegel Diagram & SO(4) Rotation)
      // We render all 32 edges as volumetric 3D tubes/cylinders rather than thin 1px lines,
      // creating the unmistakable authentic 3D wireframe hypercube structure with corner nodes.
      const edgeRadius = 0.07;
      const edgeRadialSegments = 8;
      const unitCylinder = new THREE.CylinderGeometry(edgeRadius, edgeRadius, 1, edgeRadialSegments);
      unitCylinder.rotateX(Math.PI / 2); // align along Z axis so lookAt works directly

      const edgeMeshMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0xdddddd : 0x222222,
        roughness: 0.2,
        metalness: 0.9,
      });

      const redAccentEdgeMat = new THREE.MeshStandardMaterial({
        color: 0xD71921,
        roughness: 0.15,
        metalness: 0.7,
        emissive: 0xD71921,
        emissiveIntensity: 0.25,
      });

      // Group for the 32 volumetric edges
      const edgeMeshes = [];
      for (let i = 0; i < edges4D.length; i++) {
        const [v1, v2] = edges4D[i];
        // Connectors between inner & outer cells get red accent highlights (the 8 connecting struts)
        const isInterCellStrut = (v1 & 8) !== (v2 & 8);
        const strut = new THREE.Mesh(unitCylinder, isInterCellStrut ? redAccentEdgeMat : edgeMeshMat);
        chainGroup.add(strut);
        edgeMeshes.push({ mesh: strut, startIdx: v1, endIdx: v2 });
      }

      // 4. 16 Vertex Node Telemetry Spheres (Positioned exactly at the 16 4-cube vertices)
      const nodeGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xD71921,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0xD71921,
        emissiveIntensity: 0.45,
      });
      const nodeMeshes = [];
      for (let i = 0; i < 16; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        chainGroup.add(node);
        nodeMeshes.push(node);
      }

      // 5. 24 2D Square Faces (The 24 square faces of the 4-cube)
      // Each square face is formed by 4 vertices with 2 fixed coordinates and 2 varying
      const faces4D = [];
      for (let d1 = 0; d1 < 4; d1++) {
        for (let d2 = d1 + 1; d2 < 4; d2++) {
          for (let s1 = 0; s1 < 2; s1++) {
            for (let s2 = 0; s2 < 2; s2++) {
              const base = (s1 << d1) | (s2 << d2);
              const otherBits = [0, 1, 2, 3].filter(d => d !== d1 && d !== d2);
              const i0 = base;
              const i1 = base | (1 << otherBits[0]);
              const i3 = base | (1 << otherBits[1]);
              const i2 = base | (1 << otherBits[0]) | (1 << otherBits[1]);
              faces4D.push([i0, i1, i2, i3]);
            }
          }
        }
      }

      // Index buffer for 24 quadrilaterals (48 triangles)
      const faceIndices = [];
      for (let f = 0; f < faces4D.length; f++) {
        const baseV = f * 4;
        faceIndices.push(baseV, baseV + 1, baseV + 2);
        faceIndices.push(baseV, baseV + 2, baseV + 3);
      }

      const facePositions = new Float32Array(faces4D.length * 4 * 3);
      const faceGeometry = new THREE.BufferGeometry();
      faceGeometry.setAttribute('position', new THREE.BufferAttribute(facePositions, 3));
      faceGeometry.setIndex(faceIndices);

      const faceMaterial = new THREE.MeshBasicMaterial({
        color: isDark ? 0xffffff : 0x000000,
        transparent: true,
        opacity: isDark ? 0.045 : 0.035,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const tesseractFaces = new THREE.Mesh(faceGeometry, faceMaterial);
      chainGroup.add(tesseractFaces);

      // 6. Nothing OS Technical Gimbal / Orbital Wireframe Ring
      const ringGeo = new THREE.RingGeometry(8.4, 8.48, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xD71921,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.45 : 0.35,
      });
      orbitalRing = new THREE.Mesh(ringGeo, ringMat);
      orbitalRing.rotation.x = Math.PI / 2.2;
      chainGroup.add(orbitalRing);

      // 7. Glowing Particle Cloud Telemetry (Surrounding the 4D Tesseract)
      const particleCount = 260;
      const pPositions = new Float32Array(particleCount * 3);
      originalPositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const edgeIdx = i % edges4D.length;
        const [vStartIdx, vEndIdx] = edges4D[edgeIdx];
        const p1 = vertices4D[vStartIdx];
        const p2 = vertices4D[vEndIdx];

        // Interpolate along 4D edge + radial drift
        const lx = p1[0] + (p2[0] - p1[0]) * (i % 5) / 5 + (Math.random() - 0.5) * 0.3;
        const ly = p1[1] + (p2[1] - p1[1]) * (i % 5) / 5 + (Math.random() - 0.5) * 0.3;
        const lz = p1[2] + (p2[2] - p1[2]) * (i % 5) / 5 + (Math.random() - 0.5) * 0.3;

        pPositions[i * 3] = lx;
        pPositions[i * 3 + 1] = ly;
        pPositions[i * 3 + 2] = lz;

        originalPositions[i * 3] = lx;
        originalPositions[i * 3 + 1] = ly;
        originalPositions[i * 3 + 2] = lz;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

      // Circular Glowing Texture
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, '#D71921');
      grad.addColorStop(0.7, 'rgba(215, 25, 33, 0.4)');
      grad.addColorStop(1, 'rgba(215, 25, 33, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      const pTexture = new THREE.CanvasTexture(canvas);

      const pMaterial = new THREE.PointsMaterial({
        color: 0xD71921,
        size: 0.65,
        map: pTexture,
        transparent: true,
        opacity: isDark ? 0.95 : 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      particles = new THREE.Points(particleGeo, pMaterial);
      chainGroup.add(particles);

      scene.add(chainGroup);

      // 9. Interaction Listeners
      const handleMouseMove = (e) => {
        const cx = (e.clientX / window.innerWidth) * 2 - 1;
        const cy = -(e.clientY / window.innerHeight) * 2 + 1;
        mouse.targetX = cx * 0.45;
        mouse.targetY = cy * 0.35;
      };

      const handleScroll = () => {
        scrollY = window.scrollY || window.pageYOffset;
      };

      const handleResize = () => {
        if (!renderer || !camera) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        updateGroupPosition();
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      // 10. Animation Loop (Continuous 4D Rotation + 3D Mouse Parallax)
      let clock = new THREE.Clock();
      const speedMultiplier = reduceMotion ? 0.25 : 1.0;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime() * speedMultiplier;

        // Smooth Mouse Parallax Lerp
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // 4D Rotation Angles (Rotating simultaneously across multiple hyperplanes)
        const angleZW = elapsedTime * 0.65;
        const angleXW = elapsedTime * 0.48;
        const angleYW = elapsedTime * 0.32;

        // Project all 16 4D vertices to 3D coordinates
        const projectedVertices = vertices4D.map(v => rotate4D(v, angleZW, angleXW, angleYW));

        // Update the 16 node sphere positions
        for (let i = 0; i < 16; i++) {
          nodeMeshes[i].position.copy(projectedVertices[i]);
        }

        // Update the 32 volumetric cylinder struts connecting the 16 projected vertices
        for (let i = 0; i < edgeMeshes.length; i++) {
          const { mesh, startIdx, endIdx } = edgeMeshes[i];
          const p1 = projectedVertices[startIdx];
          const p2 = projectedVertices[endIdx];

          // Place cylinder at midpoint between vertices
          mesh.position.lerpVectors(p1, p2, 0.5);
          // Aim cylinder towards p2 (unitCylinder was rotated along Z axis)
          mesh.lookAt(p2);
          // Scale length along Z axis to match vertex-to-vertex distance
          const dist = p1.distanceTo(p2);
          mesh.scale.set(1, 1, Math.max(dist, 0.001));
        }

        // Update the 24 square 2-faces of the tesseract
        const facePosAttr = faceGeometry.attributes.position.array;
        let fpIdx = 0;
        for (let f = 0; f < faces4D.length; f++) {
          const [v0, v1, v2, v3] = faces4D[f];
          const pts = [projectedVertices[v0], projectedVertices[v1], projectedVertices[v2], projectedVertices[v3]];
          for (let p = 0; p < 4; p++) {
            facePosAttr[fpIdx++] = pts[p].x;
            facePosAttr[fpIdx++] = pts[p].y;
            facePosAttr[fpIdx++] = pts[p].z;
          }
        }
        faceGeometry.attributes.position.needsUpdate = true;

        // Base 3D Group Rotation with mouse parallax
        chainGroup.rotation.y = elapsedTime * 0.18 + mouse.x;
        chainGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.12 + mouse.y;
        chainGroup.rotation.z = Math.cos(elapsedTime * 0.1) * 0.08;

        if (orbitalRing) {
          orbitalRing.rotation.z = -elapsedTime * 0.35;
        }

        // On-scroll particle dispersion capped at 0.45
        const posAttr = particles.geometry.attributes.position;
        const scrollFactor = Math.min(scrollY * 0.0012, 0.45);

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const ox = originalPositions[idx];
          const oz = originalPositions[idx + 2];
          const oy = originalPositions[idx + 1];

          const wave = Math.sin(elapsedTime * 2.5 + i) * 0.12;
          const disperse = 1 + scrollFactor + wave;

          posAttr.array[idx] = ox * disperse;
          posAttr.array[idx + 1] = oy * disperse;
          posAttr.array[idx + 2] = oz * disperse;
        }
        posAttr.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        // Clean up resources
        unitCylinder.dispose();
        edgeMeshMat.dispose();
        redAccentEdgeMat.dispose();
        nodeGeo.dispose();
        nodeMat.dispose();
        faceGeometry.dispose();
        faceMaterial.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        particleGeo.dispose();
        pMaterial.dispose();
        pTexture.dispose();
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('Three.js background initialization failed:', err);
      setWebGLFailed(true);
    }
  }, [theme]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* CSS Dot-Matrix Fallback only if WebGL fails on unsupported hardware */}
      {webGLFailed && (
        <div className="fixed inset-0 dot-matrix-bg opacity-70 pointer-events-none" />
      )}
    </div>
  );
}
