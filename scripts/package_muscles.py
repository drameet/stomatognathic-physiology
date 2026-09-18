import os
import trimesh
import numpy as np

MUSCLE_DIR = r"d:\partof_BP3D_4.0_obj_99\physiology\public\models\muscles"
OUTPUT_GLB = r"d:\partof_BP3D_4.0_obj_99\physiology\public\models\masticatory_muscles.glb"

# Base skull and mandible from 4.0
SKULL_4_0_PATH = r"d:\partof_BP3D_4.0_obj_99\partof_BP3D_4.0_obj_99\FJ3394.obj" # Sphenoid
MANDIBLE_4_0_PATH = r"d:\partof_BP3D_4.0_obj_99\partof_BP3D_4.0_obj_99\FJ3392.obj" # Mandible

def process_muscles():
    if not os.path.exists(MUSCLE_DIR):
        print("Muscle directory not found yet.")
        return

    # 1. Load Sphenoid to get anchor center for Three.js coordinates
    sphenoid_4_0 = trimesh.load(SKULL_4_0_PATH, process=False)
    sphenoid_center = sphenoid_4_0.centroid
    print(f"4.0 Sphenoid Center: {sphenoid_center}")

    # T_rot transformation from BodyParts3D 4.0 space to Three.js space:
    # X_3js = X - Sphenoid_X
    # Y_3js = Z - Sphenoid_Z  (Superior -> +Y)
    # Z_3js = -(Y - Sphenoid_Y) (Anterior -> +Z)
    T_rot_4_0 = np.array([
        [1.0,  0.0,  0.0, -sphenoid_center[0]],
        [0.0,  0.0,  1.0, -sphenoid_center[2]],
        [0.0, -1.0,  0.0,  sphenoid_center[1]],
        [0.0,  0.0,  0.0,  1.0]
    ])

    # 2. Similarity transform from 3.0 to 4.0 (fitted from multi-bone controls):
    # scale = 1.059369874098004
    # rotation and translation in BodyParts3D native coordinate system
    scale = 1.059369874098004
    R_3_to_4 = np.array([
        [0.9999999697814653, -0.00022542358070208187, 0.00009808811509434028],
        [0.00022540964137606034, 0.9999999644993117, 0.00014209810025212806],
        [-0.00009812014387505785, -0.000142075985950868, 0.9999999850934261]
    ])
    t_3_to_4 = np.array([-0.15057996010419217, 15.397670982185474, -99.29859059211003])

    T_3_to_4 = np.eye(4)
    T_3_to_4[:3, :3] = R_3_to_4 * scale
    T_3_to_4[:3, 3] = t_3_to_4

    # Combined transform: 3.0 raw OBJ -> 4.0 native -> Three.js space
    T_combined = T_rot_4_0 @ T_3_to_4

    # 3. Load all extracted muscle files
    muscle_files = [f for f in os.listdir(MUSCLE_DIR) if f.endswith(".obj") and not f.startswith("mandible_control")]
    print(f"Found {len(muscle_files)} muscle files to process:")

    scene = trimesh.Scene()

    for mf in sorted(muscle_files):
        mpath = os.path.join(MUSCLE_DIR, mf)
        mesh_name = os.path.splitext(mf)[0]
        m = trimesh.load(mpath, process=False)
        if isinstance(m, trimesh.Scene):
            m = trimesh.util.concatenate(list(m.geometry.values()))

        # Apply combined registration & centering transform
        m.apply_transform(T_combined)

        # Set mesh metadata
        m.metadata["name"] = mesh_name
        scene.add_geometry(m, node_name=mesh_name, geom_name=mesh_name)
        print(f"  Processed {mesh_name:<28} | Vertices: {len(m.vertices):>6} | Centroid: {m.centroid.round(2)}")

    # 4. Export as GLB
    glb_data = scene.export(file_type="glb")
    with open(OUTPUT_GLB, "wb") as f:
        f.write(glb_data)
    print(f"\nSuccessfully exported {OUTPUT_GLB} ({len(glb_data)/(1024*1024):.2f} MB)")

if __name__ == "__main__":
    process_muscles()
