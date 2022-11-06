import { VertexBuffer } from "core/Buffers";
import type { Engine } from "core/Engines";
import { NullEngine } from "core/Engines";
import { Matrix, Vector3 } from "core/Maths";
import type { Mesh } from "core/Meshes";
import { MeshBuilder } from "core/Meshes";
import { Scene } from "core/scene";

describe("Mesh Baking", () => {
    // prettier-ignore
    // Box vertices for box with size 1, centered at origin, it contains 8 vertices [x, y, z].
    const boxVerticesDefault: ReadonlyArray<number> = [
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,

        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,

        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,

        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,

        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,

        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,

        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
    ];

    describe("bakeTransformIntoVertices", () => {
        let subject: Engine;
        let scene: Scene;
        let box: Mesh;

        beforeEach(() => {
            subject = new NullEngine({
                renderHeight: 256,
                renderWidth: 256,
                textureSize: 256,
                deterministicLockstep: false,
                lockstepMaxSteps: 1,
            });
            scene = new Scene(subject);
            box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        });

        it("should be able to bake transform into vertices", () => {
            // At start, vertices should be the same as boxVerticesDefault
            const vPositions0 = box.getVerticesData(VertexBuffer.PositionKind);
            expect(vPositions0).toEqual(boxVerticesDefault);

            // Bake transform into vertices with shift by 5 units on Y axis
            const modifiedMesh = box.bakeTransformIntoVertices(Matrix.Translation(0, 5, 0));

            // Method should return same mesh
            expect(modifiedMesh).toBe(box);

            // After baking, vertices should be shifted by 5 units on Y axis
            const vPositionsResult = box.getVerticesData(VertexBuffer.PositionKind);

            // prettier-ignore
            const expectedBoxVerticesShifted: ReadonlyArray<number> = [
                0.5, 4.5, 0.5,
                -0.5, 4.5, 0.5,
                -0.5, 5.5, 0.5,

                0.5, 5.5, 0.5,
                0.5, 5.5, -0.5,
                -0.5, 5.5, -0.5,

                -0.5, 4.5, -0.5,
                0.5, 4.5, -0.5,
                0.5, 5.5, -0.5,

                0.5, 4.5, -0.5,
                0.5, 4.5, 0.5,
                0.5, 5.5, 0.5,

                -0.5, 5.5, 0.5,
                -0.5, 4.5, 0.5,
                -0.5, 4.5, -0.5,

                -0.5, 5.5, -0.5,
                -0.5, 5.5, 0.5,
                -0.5, 5.5, -0.5,

                0.5, 5.5, -0.5,
                0.5, 5.5, 0.5,
                0.5, 4.5, 0.5,

                0.5, 4.5, -0.5,
                -0.5, 4.5, -0.5,
                -0.5, 4.5, 0.5,
            ];

            expect(vPositionsResult).toStrictEqual(expectedBoxVerticesShifted);
        });

        it("should flip faces for inverted transform", () => {
            // Bake transform into vertices with inverted transform
            const inverseTransform = Matrix.Scaling(-1, -1, -1);
            box.bakeTransformIntoVertices(inverseTransform);
            const vPositionsResult = box.getVerticesData(VertexBuffer.PositionKind);

            // prettier-ignore
            const expectedBoxVerticesInverted: ReadonlyArray<number> = [
                -0.5, 0.5, -0.5,
                0.5, 0.5, -0.5,
                0.5, -0.5, -0.5,

                -0.5, -0.5, -0.5,
                -0.5, -0.5, 0.5,
                0.5, -0.5, 0.5,

                0.5, 0.5, 0.5,
                -0.5, 0.5, 0.5,
                -0.5, -0.5, 0.5,

                -0.5, 0.5, 0.5,
                -0.5, 0.5, -0.5,
                -0.5, -0.5, -0.5,

                0.5, -0.5, -0.5,
                0.5, 0.5, -0.5,
                0.5, 0.5, 0.5,

                0.5, -0.5, 0.5,
                0.5, -0.5, -0.5,
                0.5, -0.5, 0.5,

                -0.5, -0.5, 0.5,
                -0.5, -0.5, -0.5,
                -0.5, 0.5, -0.5,

                -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
                0.5, 0.5, -0.5,
            ];

            expect(vPositionsResult).toEqual(expectedBoxVerticesInverted);
        });

        it("should skip transforms when vertices are not exist and return source mesh", () => {
            // Remove vertices from mesh
            box.getVertexBuffer(VertexBuffer.PositionKind)?.dispose();

            // And after it the box should not have vertices
            const vPositionsResult = box.getVerticesData(VertexBuffer.PositionKind);
            expect(vPositionsResult).toBeFalsy();

            // Bake the box without vertices should return original mesh
            const inverseTransform = Matrix.Scaling(-1, -1, -1);
            const modifiedMesh = box.bakeTransformIntoVertices(inverseTransform);
            expect(modifiedMesh).toBe(box);
        });
    });

    describe("bakeCurrentTransformIntoVertices", () => {
        let subject: Engine;
        let scene: Scene;
        let box: Mesh;

        beforeEach(() => {
            subject = new NullEngine({
                renderHeight: 256,
                renderWidth: 256,
                textureSize: 256,
                deterministicLockstep: false,
                lockstepMaxSteps: 1,
            });
            scene = new Scene(subject);
            box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        });

        it("should bake transform into vertices", () => {
            box.scaling.z = 2;
            box.position.y = 5;
            box.rotation.x = Math.PI / 2;

            box.bakeCurrentTransformIntoVertices();

            // After baking the box vertices should not be equal to default
            const vPositionsResult = box.getVerticesData(VertexBuffer.PositionKind);
            expect(vPositionsResult).not.toStrictEqual(boxVerticesDefault);

            // And mesh transformation should be reset
            expect(box.scaling).toEqual(Vector3.One());
            expect(box.position).toEqual(Vector3.Zero());
            expect(box.rotation).toEqual(Vector3.Zero());
        });
    });
});
