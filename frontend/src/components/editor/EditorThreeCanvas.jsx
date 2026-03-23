import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Grid, OrbitControls } from "@react-three/drei";

function computeSceneBounds(walls = [], mmPerPixel, wallHeightMm = 2400) {
    if (!walls.length) {
        return {
            centerX: 0,
            centerZ: 0,
            width: 6000,
            depth: 6000,
            height: wallHeightMm,
        };
    }

    const xs = [];
    const zs = [];

    walls.forEach((wall) => {
        const startX = mmPerPixel ? wall.start.x * mmPerPixel : wall.start.x;
        const startZ = mmPerPixel ? wall.start.y * mmPerPixel : wall.start.y;
        const endX = mmPerPixel ? wall.end.x * mmPerPixel : wall.end.x;
        const endZ = mmPerPixel ? wall.end.y * mmPerPixel : wall.end.y;

        xs.push(startX, endX);
        zs.push(startZ, endZ);
    });

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    const padding = 400;

    return {
        centerX: (minX + maxX) / 2,
        centerZ: (minZ + maxZ) / 2,
        width: Math.max(2000, maxX - minX + padding * 2),
        depth: Math.max(2000, maxZ - minZ + padding * 2),
        height: wallHeightMm,
    };
}

function WallMesh({
    wall,
    mmPerPixel,
    wallHeightMm = 2400,
    wallThicknessMm = 120,
    sceneCenterX = 0,
    sceneCenterZ = 0,
}) {
    const meshData = useMemo(() => {
        const dxPx = wall.end.x - wall.start.x;
        const dyPx = wall.end.y - wall.start.y;

        const lengthPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
        const lengthMm = mmPerPixel ? lengthPx * mmPerPixel : lengthPx;

        const centerXPx = (wall.start.x + wall.end.x) / 2;
        const centerYPx = (wall.start.y + wall.end.y) / 2;

        const rawX = mmPerPixel ? centerXPx * mmPerPixel : centerXPx;
        const rawZ = mmPerPixel ? centerYPx * mmPerPixel : centerYPx;

        const x = rawX - sceneCenterX;
        const z = rawZ - sceneCenterZ;

        const rotationY = Math.atan2(dyPx, dxPx);

        return {
            position: [x, wallHeightMm / 2, z],
            rotation: [0, -rotationY, 0],
            size: [Math.max(lengthMm, 1), wallHeightMm, wallThicknessMm],
        };
    }, [wall, mmPerPixel, wallHeightMm, wallThicknessMm, sceneCenterX, sceneCenterZ]);

    return (
        <mesh
            position={meshData.position}
            rotation={meshData.rotation}
            castShadow
            receiveShadow
        >
            <boxGeometry args={meshData.size} />
            <meshStandardMaterial color="#d1d5db" />
        </mesh>
    );
}

function FloorPlane({ width, depth }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#f8fafc" />
        </mesh>
    );
}

function SceneLights() {
    return (
        <>
            <ambientLight intensity={0.95} />
            <directionalLight
                position={[2500, 4200, 2600]}
                intensity={1.15}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
        </>
    );
}

function CameraAutoFit({ bounds, controlsRef, fitTrigger }) {
    const { camera, size } = useThree();

    useEffect(() => {
        const halfWidth = bounds.width / 2;
        const halfDepth = bounds.depth / 2;
        const halfHeight = bounds.height / 2;

        const center = new THREE.Vector3(0, halfHeight, 0);

        const radius = Math.sqrt(
            halfWidth * halfWidth + halfDepth * halfDepth + halfHeight * halfHeight
        );

        const fov = THREE.MathUtils.degToRad(camera.fov);
        const aspect = size.width / Math.max(size.height, 1);

        const fitHeightDistance = radius / Math.sin(fov / 2);
        const fitWidthDistance =
            radius / Math.sin(Math.atan(Math.tan(fov / 2) * aspect));

        const distance = Math.max(fitHeightDistance, fitWidthDistance) * 0.9;

        camera.position.set(
            center.x + distance * 0.82,
            center.y + distance * 0.52,
            center.z + distance * 0.82
        );

        camera.near = 10;
        camera.far = 100000;
        camera.updateProjectionMatrix();

        if (controlsRef.current) {
            controlsRef.current.target.set(center.x, center.y * 0.7, center.z);
            controlsRef.current.update();
        }
    }, [camera, size, bounds, controlsRef, fitTrigger]);

    return null;
}

function SceneContent({
    walls,
    mmPerPixel,
    wallHeightMm,
    wallThicknessMm,
    fitTrigger,
    controlsRef,
}) {
    const bounds = useMemo(
        () => computeSceneBounds(walls, mmPerPixel, wallHeightMm),
        [walls, mmPerPixel, wallHeightMm]
    );

    return (
        <>
            <color attach="background" args={["#f7f8fc"]} />
            <SceneLights />

            <CameraAutoFit
                bounds={bounds}
                controlsRef={controlsRef}
                fitTrigger={fitTrigger}
            />

            <FloorPlane width={bounds.width} depth={bounds.depth} />

            {walls.map((wall) => (
                <WallMesh
                    key={wall.id}
                    wall={wall}
                    mmPerPixel={mmPerPixel}
                    wallHeightMm={wallHeightMm}
                    wallThicknessMm={wallThicknessMm}
                    sceneCenterX={bounds.centerX}
                    sceneCenterZ={bounds.centerZ}
                />
            ))}

            <Grid
                args={[Math.max(bounds.width, bounds.depth) + 1000, 40]}
                cellSize={250}
                cellThickness={0.6}
                sectionSize={1000}
                sectionThickness={1.2}
                fadeDistance={20000}
                fadeStrength={1}
                position={[0, 1, 0]}
            />

            <Environment preset="city" />

            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.08}
                minDistance={300}
                maxDistance={50000}
                maxPolarAngle={Math.PI / 2.02}
            />
        </>
    );
}

export default function EditorThreeCanvas({
    walls = [],
    mmPerPixel,
    wallHeightMm = 2400,
    wallThicknessMm = 120,
}) {
    const [fitTrigger, setFitTrigger] = useState(0);
    const controlsRef = useRef(null);

    const handleFitView = useCallback(() => {
        setFitTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        setFitTrigger((prev) => prev + 1);
    }, [walls, mmPerPixel, wallHeightMm, wallThicknessMm]);

    return (
        <section className="editor-canvas-panel editor-canvas-panel-3d">
            <div className="editor-canvas-topbar">
                <div className="editor-canvas-status">
                    <span>3D 뷰</span>
                    <span>·</span>
                    <span>벽 {walls.length}개</span>
                    <span>·</span>
                    <span>자동 맞춤</span>
                </div>

                <div className="editor-canvas-controls">
                    <button
                        type="button"
                        className="editor-canvas-btn"
                        onClick={handleFitView}
                    >
                        전체 보기
                    </button>
                </div>
            </div>

            <div className="editor-three-wrap">
                <Canvas
                    style={{ width: "100%", height: "100%", display: "block" }}
                    shadows={{ type: THREE.PCFShadowMap }}
                    camera={{ position: [3000, 2200, 3000], fov: 45 }}
                >
                    <SceneContent
                        walls={walls}
                        mmPerPixel={mmPerPixel}
                        wallHeightMm={wallHeightMm}
                        wallThicknessMm={wallThicknessMm}
                        fitTrigger={fitTrigger}
                        controlsRef={controlsRef}
                    />
                </Canvas>
            </div>
        </section>
    );
}