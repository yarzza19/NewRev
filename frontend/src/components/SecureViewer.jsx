import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/*
  ==============================================================
  🛡️ REGLA DE ORO DE SEGURIDAD 3D EN EL NAVEGADOR
  ==============================================================
  Cualquier cosa renderizada en WebGL puede ser extraída de la memoria de la GPU
  o interceptada a través de la pestaña 'Network' del navegador. 
  
  LA ÚNICA MANERA DE PROTEGER EL MODELO PARA IMPRESIÓN es que la URL 
  ("modelDisplayUrl") NUNCA sea el .STL o .STEP original. 
  Debe ser un modelo exportado a formato .GLB (glTF) al cual se le aplicado
  el filtro "Decimate" (reducir los polígonos hasta que pierda el nivel de 
  detalle necesario para la impresión 3D comercial) o compresión Draco.
*/

function Model({ url, materialOption }) {
    // useGLTF carga rápido y solo descarga el modelo degradado
    const { scene } = useGLTF(url);

    // Re-aplicar materiales de manera dinámica cada vez que cambie la opción
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                // Ignorar los materiales originales y forzar la estética NewRev
                if (materialOption === 'plata') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: '#c0c0c0',     // Gris plata
                        metalness: 0.9,       // Muy metálico
                        roughness: 0.15,      // Levemente pulido
                        envMapIntensity: 1.5,
                    });
                } else if (materialOption === 'negro-mate') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: '#1a1a1a',     // Casi negro
                        metalness: 0.1,       // Poco metálico
                        roughness: 0.85,      // Muy mate
                    });
                }
            }
        });
    }, [scene, materialOption]);

    return <primitive object={scene} />;
}

export default function SecureViewer({ design, displayModelUrl }) {
    const [material, setMaterial] = useState('negro-mate');

    const handleBuy = () => {
        // Lógica para añadir al carrito
        console.log(`Comprando pieza física: ${design.title}`);
    };

    return (
        <div className="secure-viewer-container" style={styles.container}>

            {/* Contenedor del Visor 3D WebGL */}
            <div className="canvas-wrapper" style={styles.canvasWrapper}>
                <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                    <Suspense fallback={null}>
                        {/* Stage nos provee iluminación realista de estudio automática */}
                        <Stage environment="studio" intensity={0.6}>
                            <Center>
                                <Model url={displayModelUrl} materialOption={material} />
                            </Center>
                        </Stage>
                    </Suspense>

                    {/* Controles para el usuario: rotar y zoom, pero limitados para que no se pierdan */}
                    <OrbitControls
                        makeDefault
                        enablePan={false}
                        minDistance={2}
                        maxDistance={10}
                        autoRotate
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </div>

            {/* Controles de Vista de la UI */}
            <div className="ui-controls" style={styles.uiControls}>
                <div style={styles.materials}>
                    <button
                        style={material === 'plata' ? styles.btnActive : styles.btn}
                        onClick={() => setMaterial('plata')}>Plata
                    </button>
                    <button
                        style={material === 'negro-mate' ? styles.btnActive : styles.btn}
                        onClick={() => setMaterial('negro-mate')}>Negro Mate
                    </button>
                </div>
            </div>

            {/* Acción Principal */}
            <button style={styles.buyButton} onClick={handleBuy}>
                Comprar pieza física - Fabricada por NewRev
            </button>

        </div>
    );
}

// Estilos básicos en línea para el concepto
const styles = {
    container: {
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
    },
    canvasWrapper: {
        height: '500px',
        width: '100%',
        backgroundColor: '#e6e6e6',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
    uiControls: {
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 0',
    },
    materials: {
        display: 'flex',
        gap: '10px',
    },
    btn: {
        padding: '8px 16px', borderRadius: '20px', border: '1px solid #ccc',
        background: '#fff', cursor: 'pointer', transition: 'all 0.2s'
    },
    btnActive: {
        padding: '8px 16px', borderRadius: '20px', border: 'none',
        background: '#000', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
    },
    buyButton: {
        padding: '18px 24px',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        fontSize: '1.2rem',
        fontWeight: '800',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        transition: 'transform 0.1s',
    }
};
