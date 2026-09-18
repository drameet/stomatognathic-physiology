import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MandibularKinematics, BICONDYLAR_PIVOT } from '../../physics/tmjKinematics';
import { DynamicMuscleLine } from '../../physics/muscleVectors';
import { PosseltEnvelopeData } from '../../physics/posseltGeometry';
import { lookupAnatomy } from '../../data/anatomicalManifest';
import { InspectedAnatomy } from '../hud/AnatomicalTooltip';
import groundTruth from '../../data/jawGroundTruth.json';

interface ViewportProps {
  kinematics: MandibularKinematics;
  muscleLines: DynamicMuscleLine[];
  posseltData: PosseltEnvelopeData;
  showMuscles: boolean;
  showPosselt: boolean;
  showBones: boolean;
  activeContactPoint: [number, number, number];
  onPickContact?: (siteName: string) => void;
  onHoverAnatomy?: (item: InspectedAnatomy | null) => void;
  isolatedId?: string | null;
  cameraPreset?: string | null;
  mode?: string;
}

export const Viewport: React.FC<ViewportProps> = ({
  kinematics,
  muscleLines,
  posseltData,
  showMuscles,
  showPosselt,
  showBones,
  activeContactPoint,
  onHoverAnatomy,
  isolatedId,
  cameraPreset,
  mode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Group references
  const craniumGroupRef = useRef<THREE.Group>(new THREE.Group());
  const mandibleGroupRef = useRef<THREE.Group>(new THREE.Group());
  const realMusclesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const vectorLinesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const posseltGroupRef = useRef<THREE.Group>(new THREE.Group());
  const incisalCursorRef = useRef<THREE.Mesh | null>(null);
  const contactMarkerRef = useRef<THREE.Mesh | null>(null);

  // Map of real BodyParts3D muscle meshes
  const muscleMeshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  // Map of all mesh objects for isolation focus
  const allMeshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Model loading state
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Real bicondylar hinge axis pivot in BodyParts3D coordinate space
  const [pivotX, pivotY, pivotZ] = BICONDYLAR_PIVOT; // [0.0, -11.4, -23.5]

  // Dynamic Two-Joint Muscle Deformation function
  const updateMuscleDeformation = useCallback((kin: MandibularKinematics) => {
    const [pitch, yaw, roll] = kin.rotation;
    const [tx, ty, tz] = kin.translation;

    const euler = new THREE.Euler(pitch, yaw, roll, 'XYZ');
    const rotMat = new THREE.Matrix4().makeRotationFromEuler(euler);
    const el = rotMat.elements;
    const r00 = el[0], r01 = el[4], r02 = el[8];
    const r10 = el[1], r11 = el[5], r12 = el[9];
    const r20 = el[2], r21 = el[6], r22 = el[10];

    muscleMeshesMapRef.current.forEach((mesh) => {
      const geo = mesh.geometry;
      const base = geo.userData.basePositions as Float32Array | undefined;
      const weights = geo.userData.blendWeights as Float32Array | undefined;
      if (!base || !weights) return;

      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const pos = posAttr.array as Float32Array;
      const count = weights.length;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const w = weights[i];
        if (w <= 0.0001) {
          pos[idx] = base[idx];
          pos[idx + 1] = base[idx + 1];
          pos[idx + 2] = base[idx + 2];
          continue;
        }

        const x0 = base[idx];
        const y0 = base[idx + 1];
        const z0 = base[idx + 2];

        // Delta from bicondylar hinge axis
        const dx = x0 - pivotX;
        const dy = y0 - pivotY;
        const dz = z0 - pivotZ;

        // Rotate around bicondylar transverse hinge axis
        const rx = r00 * dx + r01 * dy + r02 * dz;
        const ry = r10 * dx + r11 * dy + r12 * dz;
        const rz = r20 * dx + r21 * dy + r22 * dz;

        // Target position on mandible
        const targetX = rx + pivotX + tx;
        const targetY = ry + pivotY + ty;
        const targetZ = rz + pivotZ + tz;

        // Two-joint blend skinning: (1 - w) * cranial_origin + w * mandibular_target
        pos[idx] = x0 + w * (targetX - x0);
        pos[idx + 1] = y0 + w * (targetY - y0);
        pos[idx + 2] = z0 + w * (targetZ - z0);
      }

      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
    });
  }, [pivotX, pivotY, pivotZ]);

  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e); // Museum obsidian
    sceneRef.current = scene;

    // Depth fog
    scene.fog = new THREE.FogExp2(0x07090e, 0.0018);

    // 2. Camera Setup (Responsive for Mobile and Desktop)
    const isMobile = width < 768;
    const initialFov = isMobile ? 50 : 40;
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 1, 2500);
    if (isMobile) {
      camera.position.set(0, 15, 340);
    } else {
      camera.position.set(240, 15, 250);
    }
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls (Smooth Touch Gestures on Mobile)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, -35, 10);
    controls.maxDistance = 700;
    controls.minDistance = 35;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controlsRef.current = controls;

    // 5. Lighting (Editorial museum & surgical illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffdf5, 2.2);
    keyLight.position.set(160, 190, 160);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-180, 130, -140);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.8);
    fillLight.position.set(0, -160, 120);
    scene.add(fillLight);

    // 6. Architectural Floor Grid
    const grid = new THREE.GridHelper(500, 50, 0x1e293b, 0x0f172a);
    grid.position.y = -140;
    scene.add(grid);

    // 7. Clear & Add anatomical groups
    craniumGroupRef.current.clear();
    mandibleGroupRef.current.clear();
    realMusclesGroupRef.current.clear();
    vectorLinesGroupRef.current.clear();
    posseltGroupRef.current.clear();
    allMeshesMapRef.current.clear();
    muscleMeshesMapRef.current.clear();

    scene.add(craniumGroupRef.current);
    scene.add(mandibleGroupRef.current);
    scene.add(realMusclesGroupRef.current);
    scene.add(vectorLinesGroupRef.current);
    scene.add(posseltGroupRef.current);

    // 8. Load Real BodyParts3D Skeletal Anatomy
    const gltfLoader = new GLTFLoader();
    const skullUrl = `${import.meta.env.BASE_URL}models/skull_atlas.glb`;
    const musclesUrl = `${import.meta.env.BASE_URL}models/masticatory_muscles.glb`;

    // PBR Tissue Materials
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf2ebe1, // Warm ivory bone finish
      roughness: 0.45,
      metalness: 0.04
    });

    const craniumMaterial = new THREE.MeshStandardMaterial({
      color: 0xecd9c6, // Classic cranial cortical bone
      roughness: 0.50,
      metalness: 0.04
    });

    const dentalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Radiopaque dental enamel with high specular
      roughness: 0.18,
      metalness: 0.06
    });

    // Articular Eminence guides
    const tmjGuideMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });

    const fossaL = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 24), tmjGuideMaterial);
    fossaL.position.set(44, -11.4, -23.5);
    fossaL.rotation.x = (35 * Math.PI) / 180;
    craniumGroupRef.current.add(fossaL);

    const fossaR = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 24), tmjGuideMaterial);
    fossaR.position.set(-44, -11.4, -23.5);
    fossaR.rotation.x = (35 * Math.PI) / 180;
    craniumGroupRef.current.add(fossaR);

    // Load Bones
    gltfLoader.load(
      skullUrl,
      (gltf) => {
        if (!isMounted) return;
        craniumGroupRef.current.clear();
        craniumGroupRef.current.add(fossaL);
        craniumGroupRef.current.add(fossaR);
        mandibleGroupRef.current.clear();

        const meshesToAdd: THREE.Mesh[] = [];
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshesToAdd.push(child);
          }
        });

        meshesToAdd.forEach((mesh) => {
          const name = mesh.name.toLowerCase();
          const isTooth = name.startsWith('tooth_');
          const isLowerJaw = name.includes('mandible') ||
            name.startsWith('tooth_3') ||
            name.startsWith('tooth_4');

          mesh.geometry.computeVertexNormals();
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Clone material so each part can support independent transparency for isolation mode
          if (isTooth) {
            mesh.material = dentalMaterial.clone();
          } else if (name.includes('mandible')) {
            mesh.material = boneMaterial.clone();
          } else {
            mesh.material = craniumMaterial.clone();
          }

          allMeshesMapRef.current.set(name, mesh);

          if (isLowerJaw) {
            mesh.geometry.translate(-pivotX, -pivotY, -pivotZ);
            mandibleGroupRef.current.add(mesh);
          } else {
            craniumGroupRef.current.add(mesh);
          }
        });

        // Load Real BodyParts3D Masticatory Muscles & Precompute Two-Joint Skinning Weights
        gltfLoader.load(
          musclesUrl,
          (muscleGltf) => {
            if (!isMounted) return;
            setIsLoadingModel(false);
            realMusclesGroupRef.current.clear();
            muscleMeshesMapRef.current.clear();

            const muscleMeshes: THREE.Mesh[] = [];
            muscleGltf.scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                muscleMeshes.push(child);
              }
            });

            muscleMeshes.forEach((mesh) => {
              const name = mesh.name.toLowerCase();
              mesh.geometry.computeVertexNormals();
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // Pre-calculate Two-Joint Blend Weights for dynamic soft-tissue deformation
              const geo = mesh.geometry;
              const posAttr = geo.attributes.position;
              const count = posAttr.count;
              const base = new Float32Array(posAttr.array);
              const weights = new Float32Array(count);

              for (let i = 0; i < count; i++) {
                const y = base[i * 3 + 1];
                const z = base[i * 3 + 2];
                let w = 0.0;

                if (name.includes('superficial_masseter')) {
                  // Y: -11.1 (zygoma origin) to -78.2 (gonion insertion)
                  const t = (-11.1 - y) / 67.1;
                  w = Math.min(1.0, Math.max(0.0, t));
                } else if (name.includes('deep_masseter')) {
                  // Y: -15.6 (zygoma origin) to -79.4 (ramus insertion)
                  const t = (-15.6 - y) / 63.8;
                  w = Math.min(1.0, Math.max(0.0, t));
                } else if (name.includes('temporalis')) {
                  // Cranial origin Y > 5: w = 0; coronoid insertion Y = -45: w = 1
                  if (y > 5.0) {
                    w = 0.0;
                  } else {
                    const t = (5.0 - y) / 50.0;
                    w = Math.min(1.0, Math.max(0.0, t));
                  }
                } else if (name.includes('medial_pterygoid')) {
                  // Y: -14.0 (sphenoid origin) to -64.4 (mandibular angle insertion)
                  const t = (-14.0 - y) / 50.4;
                  w = Math.min(1.0, Math.max(0.0, t));
                } else if (name.includes('upper_lateral_pterygoid')) {
                  // Z: +3.2 (sphenoid origin) to -19.8 (condyle/disc insertion)
                  const t = (3.2 - z) / 23.0;
                  w = Math.min(1.0, Math.max(0.0, t));
                } else if (name.includes('lower_lateral_pterygoid')) {
                  // Z: +1.4 (lateral pterygoid plate) to -22.0 (condylar neck insertion)
                  const t = (1.4 - z) / 23.4;
                  w = Math.min(1.0, Math.max(0.0, t));
                } else if (name.includes('anterior_digastric')) {
                  // Hyoid loop origin (Z <= 8mm) to Mandibular digastric fossa attachment (Z >= 28mm)
                  if (z >= 28.0) {
                    w = 1.0;
                  } else if (z <= 8.0) {
                    w = 0.0;
                  } else {
                    const t = (z - 8.0) / 20.0;
                    w = Math.min(1.0, Math.max(0.0, t));
                  }
                }

                // Smoothstep easing: 3w^2 - 2w^3
                weights[i] = w * w * (3.0 - 2.0 * w);
              }

              geo.userData.basePositions = base;
              geo.userData.blendWeights = weights;

              // Authentic PBR muscle fascia material
              const muscleMat = new THREE.MeshStandardMaterial({
                color: 0x991b1b, // Deep anatomical garnet
                roughness: 0.48,
                metalness: 0.05,
                side: THREE.DoubleSide
              });
              mesh.material = muscleMat;

              muscleMeshesMapRef.current.set(name, mesh);
              allMeshesMapRef.current.set(name, mesh);
              realMusclesGroupRef.current.add(mesh);
            });

            // Initial muscle deformation sync
            updateMuscleDeformation(kinematics);
          },
          undefined,
          (err) => {
            console.error('Error loading BodyParts3D masticatory_muscles.glb:', err);
            setIsLoadingModel(false);
          }
        );
      },
      undefined,
      (err) => {
        console.error('Error loading BodyParts3D skull_atlas.glb:', err);
        setLoadError('Failed to load BodyParts3D skull atlas geometry.');
        setIsLoadingModel(false);
      }
    );

    // Active tracking cursor on incisal tip
    const cursorGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const cursorMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
    incisalCursorRef.current = cursorMesh;
    scene.add(cursorMesh);

    // Active occlusal contact point marker
    const contactGeo = new THREE.SphereGeometry(2.8, 16, 16);
    const contactMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      roughness: 0.2
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMarkerRef.current = contactMesh;
    scene.add(contactMesh);

    // Raycast Pointer Interaction (from ashemag/human-atlas)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const interactiveMeshes: THREE.Mesh[] = [];
      craniumGroupRef.current.traverse((c) => { if (c instanceof THREE.Mesh) interactiveMeshes.push(c); });
      mandibleGroupRef.current.traverse((c) => { if (c instanceof THREE.Mesh) interactiveMeshes.push(c); });
      realMusclesGroupRef.current.traverse((c) => { if (c instanceof THREE.Mesh) interactiveMeshes.push(c); });

      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const meta = lookupAnatomy(hitMesh.name);
        if (meta && onHoverAnatomy) {
          let forceN: number | undefined;
          let maxForceN: number | undefined;
          let strainPct: number | undefined;
          let actPct: number | undefined;

          if (meta.groundTruthId) {
            const line = muscleLines.find((m) => m.id === meta.groundTruthId);
            const gt = groundTruth.muscles.find((g) => g.id === meta.groundTruthId);
            if (line) {
              forceN = line.forceN;
              maxForceN = gt?.fmax ?? 200.0;
              actPct = line.activation * 100;
              strainPct = line.strain * 100;
            }
          }

          onHoverAnatomy({
            id: meta.id,
            name: meta.name,
            fma: meta.fma,
            category: meta.category,
            side: meta.side,
            action: meta.action,
            origin: meta.origin,
            insertion: meta.insertion,
            forceN,
            maxForceN,
            strainPct,
            activationPct: actPct
          });
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const isMob = w < 768;
      camera.aspect = w / h;
      camera.fov = isMob ? 50 : 40;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      craniumGroupRef.current.clear();
      mandibleGroupRef.current.clear();
      realMusclesGroupRef.current.clear();
      vectorLinesGroupRef.current.clear();
      posseltGroupRef.current.clear();
      allMeshesMapRef.current.clear();
      muscleMeshesMapRef.current.clear();
    };
  }, [updateMuscleDeformation]);

  // Update Mandible Kinematic Transformation & Trigger Dynamic Two-Joint Muscle Skinning
  useEffect(() => {
    const mandible = mandibleGroupRef.current;
    if (!mandible) return;

    const [pitch, yaw, roll] = kinematics.rotation;
    const [tx, ty, tz] = kinematics.translation;

    // Position mandibleGroup directly at the condylar hinge axis plus translation
    mandible.position.set(pivotX + tx, pivotY + ty, pivotZ + tz);
    mandible.rotation.set(pitch, yaw, roll, 'XYZ');

    // Update glowing incisal cursor position (visible when Posselt envelope is enabled)
    if (incisalCursorRef.current) {
      incisalCursorRef.current.visible = showPosselt;
      incisalCursorRef.current.position.set(...kinematics.incisalPoint);
    }

    // Active occlusal contact point marker: always visible in clench mode or when near centric occlusion
    if (contactMarkerRef.current) {
      const isClench = mode === 'clench';
      const isDiscluded = !isClench && (Math.abs(pitch) > 0.04 || Math.abs(ty) > 2.0);
      contactMarkerRef.current.visible = !isDiscluded;
      contactMarkerRef.current.position.set(...activeContactPoint);
    }

    // Synchronously deform all 14 BodyParts3D muscle meshes with the moving jaw!
    updateMuscleDeformation(kinematics);
  }, [kinematics, activeContactPoint, pivotX, pivotY, pivotZ, showPosselt, updateMuscleDeformation, mode]);

  // Camera Presets Effect
  useEffect(() => {
    if (!cameraPreset || !cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const isMob = window.innerWidth < 768;

    switch (cameraPreset) {
      case 'right_tmj':
        cam.position.set(-190, -10, -25);
        ctrl.target.set(15, -11.4, -23.5);
        break;
      case 'left_tmj':
        cam.position.set(190, -10, -25);
        ctrl.target.set(-15, -11.4, -23.5);
        break;
      case 'frontal':
        cam.position.set(0, -35, isMob ? 320 : 270);
        ctrl.target.set(0, -45, 20);
        break;
      case 'submental':
        cam.position.set(0, -270, 10);
        ctrl.target.set(0, -30, 0);
        break;
      case 'default':
      default:
        if (isMob) {
          cam.position.set(0, 15, 340);
        } else {
          cam.position.set(240, 15, 250);
        }
        ctrl.target.set(0, -35, 10);
        break;
    }
    ctrl.update();
  }, [cameraPreset]);

  // Isolation Focus Effect (from ashemag/human-atlas)
  useEffect(() => {
    allMeshesMapRef.current.forEach((mesh, name) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      if (!isolatedId) {
        // Normal rendering
        mat.transparent = false;
        mat.opacity = 1.0;
      } else {
        const isMatch = name === isolatedId.toLowerCase() ||
          (isolatedId.startsWith('superficial_masseter') && name.includes('superficial_masseter')) ||
          (isolatedId.startsWith('deep_masseter') && name.includes('deep_masseter')) ||
          (isolatedId.startsWith('temporalis') && name.includes('temporalis')) ||
          (isolatedId.startsWith('medial_pterygoid') && name.includes('medial_pterygoid')) ||
          (isolatedId.startsWith('lateral_pterygoid') && name.includes('lateral_pterygoid')) ||
          (isolatedId.startsWith('anterior_digastric') && name.includes('anterior_digastric'));

        if (isMatch) {
          mat.transparent = false;
          mat.opacity = 1.0;
        } else {
          mat.transparent = true;
          mat.opacity = 0.18; // Soft semi-transparent ghosting
        }
      }
    });
  }, [isolatedId]);

  // Update Real BodyParts3D Muscle Activation Emissive Sheen & Vector Lines
  useEffect(() => {
    realMusclesGroupRef.current.visible = showMuscles;

    const idToMeshName: Record<string, string[]> = {
      l_sm: ['superficial_masseter_l'],
      r_sm: ['superficial_masseter_r'],
      l_dm: ['deep_masseter_l'],
      r_dm: ['deep_masseter_r'],
      l_at: ['temporalis_l'],
      r_at: ['temporalis_r'],
      l_mt: ['temporalis_l'],
      r_mt: ['temporalis_r'],
      l_pt: ['temporalis_l'],
      r_pt: ['temporalis_r'],
      l_mp: ['medial_pterygoid_l'],
      r_mp: ['medial_pterygoid_r'],
      l_slp: ['upper_lateral_pterygoid_l'],
      r_slp: ['upper_lateral_pterygoid_r'],
      l_ilp: ['lower_lateral_pterygoid_l'],
      r_ilp: ['lower_lateral_pterygoid_r'],
      l_ad: ['anterior_digastric_l'],
      r_ad: ['anterior_digastric_r']
    };

    const meshActivations: Record<string, number> = {};
    muscleLines.forEach((m) => {
      const names = idToMeshName[m.id] || [];
      names.forEach((name) => {
        meshActivations[name] = Math.max(meshActivations[name] || 0, m.activation);
      });
    });

    muscleMeshesMapRef.current.forEach((mesh, name) => {
      const act = meshActivations[name] ?? 0.05;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (act > 0.6) {
          mat.color.setHex(0xef4444); // Neon crimson clench
          mat.emissive.setHex(0xb91c1c);
          mat.emissiveIntensity = act * 0.7;
        } else if (act > 0.25) {
          mat.color.setHex(0xf59e0b); // Active amber
          mat.emissive.setHex(0xd97706);
          mat.emissiveIntensity = act * 0.4;
        } else {
          mat.color.setHex(0x991b1b); // Resting anatomical ruby
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        }
      }
    });

    // Vector Lines
    const vectorGroup = vectorLinesGroupRef.current;
    if (!vectorGroup) return;

    while (vectorGroup.children.length > 0) {
      const obj = vectorGroup.children[0];
      vectorGroup.remove(obj);
      if (obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }

    if (!showMuscles) return;

    muscleLines.forEach((m) => {
      const pOrig = new THREE.Vector3(...m.origin);
      const pIns = new THREE.Vector3(...m.insertion);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([pOrig, pIns]);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(m.colorHex),
        transparent: true,
        opacity: 0.65,
        linewidth: 1.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      vectorGroup.add(line);

      const origDot = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      origDot.position.copy(pOrig);
      vectorGroup.add(origDot);

      const insDot = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(m.colorHex) })
      );
      insDot.position.copy(pIns);
      vectorGroup.add(insDot);
    });
  }, [muscleLines, showMuscles]);

  // Update Posselt 3D Envelope Cage
  useEffect(() => {
    const posseltGroup = posseltGroupRef.current;
    if (!posseltGroup) return;

    while (posseltGroup.children.length > 0) {
      const obj = posseltGroup.children[0];
      posseltGroup.remove(obj);
      if (obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }

    if (!showPosselt) return;

    const posseltMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.7,
      linewidth: 1.5
    });

    posseltData.gridLines.forEach((linePts) => {
      const pts = linePts.map((p) => new THREE.Vector3(...p));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, posseltMat);
      posseltGroup.add(line);
    });

    posseltData.keyPoints.forEach((kp) => {
      const sphereGeo = new THREE.SphereGeometry(1.4, 12, 12);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const marker = new THREE.Mesh(sphereGeo, sphereMat);
      marker.position.set(...kp.pos);
      posseltGroup.add(marker);
    });
  }, [posseltData, showPosselt]);

  // Toggle Bone visibility
  useEffect(() => {
    craniumGroupRef.current.visible = showBones;
    mandibleGroupRef.current.visible = showBones;
  }, [showBones]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-canvas" ref={containerRef}>
      {/* 3D Viewport Controls Overlay */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border border-slate-700/70 text-[10px] sm:text-xs text-slate-300 shadow-2xl pointer-events-none">
        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-mono uppercase tracking-wider font-semibold text-slate-200">
          BodyParts3D <span className="hidden sm:inline">· Stomatognathic Rig</span>
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-400 font-mono hidden sm:inline">Hover to Inspect • Drag to Orbit • Scroll to Zoom</span>
        <span className="text-slate-400 font-mono sm:hidden">Touch to Orbit • Pinch to Zoom</span>
      </div>

      {/* Loading indicator */}
      {isLoadingModel && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-none">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-200">Loading Real BodyParts3D Skeletal & Muscle Anatomy...</p>
          <p className="text-xs text-slate-400 font-mono mt-1">Precomputing Two-Joint Skinning & Deformation...</p>
        </div>
      )}

      {/* Error display */}
      {loadError && (
        <div className="absolute bottom-6 left-6 z-20 bg-rose-950/90 border border-rose-700/60 px-4 py-2 rounded-lg text-rose-200 text-xs shadow-xl">
          {loadError}
        </div>
      )}
    </div>
  );
};
