import * as THREE from "three";
import classNames from "classnames";
import React, { useEffect, useRef } from "react";

interface IBackgroundAnimation {
  className?: string;
}

function BackgroundAnimationComponent(props: Readonly<IBackgroundAnimation>) {
  const { className } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setClearColor(0x000a0d, 0.2);

    const width = window.innerWidth * 1.1;
    const height = window.innerHeight * 1.1;
    renderer.setSize(width, height);

    containerRef.current.appendChild(renderer.domElement);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.left = "-5%";
    renderer.domElement.style.top = "-5%";

    const group = new THREE.Group();
    scene.add(group);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 700;

    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const lines: THREE.Line[] = [];
    const connections: number = 80;

    for (let i = 0; i < particleCount; i++) {
      const radius = 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = Math.random() * 0.25 + 0.05;

      if (Math.random() > 0.7) {
        colors[i * 3] = 100 / 255;
        colors[i * 3 + 1] = 235 / 255;
        colors[i * 3 + 2] = 190 / 255;
      } else {
        colors[i * 3] = 10 / 255;
        colors[i * 3 + 1] = 60 / 255;
        colors[i * 3 + 2] = 70 / 255;
      }
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
      size: 0.2,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    for (let i = 0; i < connections; i++) {
      const p1 = Math.floor(Math.random() * particleCount);
      const p2 = Math.floor(Math.random() * particleCount);

      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(6);

      linePositions[0] = positions[p1 * 3];
      linePositions[1] = positions[p1 * 3 + 1];
      linePositions[2] = positions[p1 * 3 + 2];
      linePositions[3] = positions[p2 * 3];
      linePositions[4] = positions[p2 * 3 + 1];
      linePositions[5] = positions[p2 * 3 + 2];

      lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(linePositions, 3),
      );

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x60e8c0,
        opacity: 0.5,
        transparent: true,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
      lines.push(line);
    }

    camera.position.z = 35;

    const animate = () => {
      requestAnimationFrame(animate);

      group.rotation.x += 0.0004;
      group.rotation.y += 0.0002;

      const time = Date.now() * 0.001;
      particleMaterial.size = Math.sin(time * 0.4) * 0.1 + 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = window.innerWidth * 1.1;
      const newHeight = window.innerHeight * 1.1;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    const currentContainer = containerRef.current;

    return () => {
      if (currentContainer) {
        currentContainer.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
      lines.forEach((line) => {
        group.remove(line);
      });
      scene.remove(group);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={classNames(
        "fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-20",
        className,
      )}
      ref={containerRef}
    />
  );
}

export const BackgroundAnimation = React.memo(BackgroundAnimationComponent);
