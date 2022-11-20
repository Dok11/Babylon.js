import type { Engine } from "core/Engines";
import { NullEngine } from "core/Engines";
import { PBRMaterial, Texture } from "core/Materials";
import { PrePassRenderer } from "core/Rendering";
import "core/Rendering/prePassRendererSceneComponent";
import "core/Rendering/subSurfaceSceneComponent";
import { Scene } from "core/scene";

describe("PBRMaterial", () => {
    let subject: Engine;
    let scene: Scene;

    beforeEach(() => {
        subject = new NullEngine({
            renderHeight: 256,
            renderWidth: 256,
            textureSize: 256,
            deterministicLockstep: false,
            lockstepMaxSteps: 1,
        });
        scene = new Scene(subject);
    });

    describe("hasTexture", () => {
        let material: PBRMaterial;
        let texture: Texture;

        beforeEach(() => {
            material = new PBRMaterial("mat", scene);
            texture = new Texture("texture.jpg", scene);
        });

        it("should return false when texture not defined", () => {
            expect(material.hasTexture(texture)).toEqual(false);
        });

        it("should return true when albedo texture is defined", () => {
            material.albedoTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when ambient texture is defined", () => {
            material.ambientTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when opacity texture is defined", () => {
            material.opacityTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when reflection texture is defined", () => {
            material.reflectionTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when emissive texture is defined", () => {
            material.emissiveTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when reflectivity texture is defined", () => {
            material.reflectivityTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when metallic texture is defined", () => {
            material.metallicTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when metallic reflection texture is defined", () => {
            material.metallicReflectanceTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when reflectance texture is defined", () => {
            material.reflectanceTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when microsurface texture is defined", () => {
            material.microSurfaceTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when bump texture is defined", () => {
            material.bumpTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when lightmap texture is defined", () => {
            material.lightmapTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when refraction texture is defined", () => {
            material.refractionTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });
    });

    describe("setPrePassRenderer", () => {
        let material: PBRMaterial;

        beforeEach(() => {
            material = new PBRMaterial("mat", scene);
        });

        it("should scene prePassRenderer be disabled by default", () => {
            expect(scene.prePassRenderer).toBeUndefined();
        });

        it("should set prepass renderer when scattering enable", () => {
            material.subSurface.isScatteringEnabled = true;
            material.setPrePassRenderer();

            expect(scene.prePassRenderer).toBeDefined();
        });

        it("should not set prepass renderer when refraction disabled", () => {
            material.subSurface.isScatteringEnabled = false;
            material.setPrePassRenderer();

            expect(scene.prePassRenderer).toBeUndefined();
        });

        it("should enable subSurfaceConfiguration when PrePassRenderer supported (WebGL2)", () => {
            expect(scene.subSurfaceConfiguration?.enabled).toBeFalsy();

            jest.spyOn(PrePassRenderer.prototype, "isSupported", "get").mockReturnValue(true);

            material.subSurface.isScatteringEnabled = true;
            material.setPrePassRenderer();

            expect(scene.subSurfaceConfiguration?.enabled).toBeTruthy();
        });
    });
});
