"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Particle Field (Floating Stars) ──
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Monochrome white with varying brightness
      const brightness = 0.3 + Math.random() * 0.7;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ── Central Glass Sphere (Icosahedron) ──
    const icoGeometry = new THREE.IcosahedronGeometry(1.4, 3);
    const icoMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 1.5,
      ior: 1.5,
      transparent: true,
      opacity: 0.35,
      envMapIntensity: 1,
      side: THREE.DoubleSide,
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(icoMesh);

    // ── Wireframe overlay on sphere ──
    const wireGeometry = new THREE.IcosahedronGeometry(1.42, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    scene.add(wireMesh);

    // ── Orbital Rings ──
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });

    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.25, 128), ringMaterial);
    ring1.rotation.x = Math.PI * 0.4;
    ring1.rotation.y = Math.PI * 0.1;
    scene.add(ring1);

    const ring2Material = ringMaterial.clone();
    ring2Material.opacity = 0.04;
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.8, 2.84, 128), ring2Material);
    ring2.rotation.x = Math.PI * 0.6;
    ring2.rotation.y = Math.PI * -0.3;
    scene.add(ring2);

    // ── Small Orbiting Dots ──
    const orbitDots: THREE.Mesh[] = [];
    const orbitData: { radius: number; speed: number; offset: number; tilt: number }[] = [];
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });

    for (let i = 0; i < 6; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 12, 12),
        dotMaterial.clone()
      );
      orbitData.push({
        radius: 2 + Math.random() * 1.2,
        speed: 0.2 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 1.5,
      });
      orbitDots.push(dot);
      scene.add(dot);
    }

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 20);
    pointLight.position.set(3, 3, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 15);
    pointLight2.position.set(-4, -2, 3);
    scene.add(pointLight2);

    // ── Mouse Interaction ──
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ── Resize ──
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ── Animate ──
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Particles slow rotation
      particles.rotation.y = elapsed * 0.02;
      particles.rotation.x = elapsed * 0.01;

      // Sphere breathing + slow spin
      const breathe = 1 + Math.sin(elapsed * 0.8) * 0.04;
      icoMesh.scale.set(breathe, breathe, breathe);
      icoMesh.rotation.y = elapsed * 0.15;
      icoMesh.rotation.x = elapsed * 0.08;

      wireMesh.rotation.y = elapsed * 0.12;
      wireMesh.rotation.x = elapsed * 0.06;
      wireMesh.scale.set(breathe, breathe, breathe);

      // Rings slow spin
      ring1.rotation.z = elapsed * 0.05;
      ring2.rotation.z = -elapsed * 0.03;

      // Orbiting dots
      orbitDots.forEach((dot, i) => {
        const d = orbitData[i];
        const angle = elapsed * d.speed + d.offset;
        dot.position.x = Math.cos(angle) * d.radius;
        dot.position.z = Math.sin(angle) * d.radius;
        dot.position.y = Math.sin(angle * 0.7) * d.tilt;
      });

      // Camera react to mouse
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}
