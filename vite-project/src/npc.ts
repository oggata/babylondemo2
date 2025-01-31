import { _OcclusionDataStorage, AbstractMesh, SceneLoader, Axis, Space } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene.js";
import * as Main from './main.ts'
//import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
//import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";

export class Person {
    id: number;
    tickId: number;
    col: number;
    row: number;
    type: number;
    targetCol: number;
    targetRow: number;
    isTargetAvailable: boolean;
    mesh: AbstractMesh | undefined;
    direction: string;
    z: number;

    constructor(id: number, col: number, row: number, type: number) {
        this.id = id;
        this.col = col;
        this.row = row;
        this.targetCol = col;
        this.targetRow = row;
        this.isTargetAvailable = false;
        this.type = type;
        this.direction = "n";
        this.z = 0.2;
        if (type == 1) {
            this.tickId = Main.getRand(1, 10);
        } else {
            this.tickId = Main.getRand(10, 20);
        }
    }
    setMesh(mesh: AbstractMesh) {
        this.mesh = mesh
    }
    getMesh() {
        return this.mesh;
    }
    setIsTargetAvailable(_boolean: boolean) {
        this.isTargetAvailable = _boolean;
    }
    getIsTargetAvailable() {
        return this.isTargetAvailable;
    }
    setMeshPosition(col: number, row: number, z: number) {
        this.mesh!.position.x = col;
        this.mesh!.position.z = row;
        var c = Main.getChip(col, row);
        this.mesh!.position.y = c!.h + z;
    }
    setDirection(direction: string) {
        this.direction = direction;
        if (this.direction == "n") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 1, Space.LOCAL);
        } else if (this.direction == "s") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 1, Space.LOCAL);
        } else if (this.direction == "w") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 1, Space.LOCAL);
        } else if (this.direction == "e") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 1, Space.LOCAL);
        }
    }
}

export function createNPC(scene: Scene, type: number) {
    //var boxSize = { width: 0.2, height: 1, depth: 0.2 };
    //var mesh = MeshBuilder.CreateBox("box", boxSize);
    //var animForward: AnimationGroup;
    var fileName = "Animated_Human.glb";
    var scale = 0.15;
    if (type == 2) {
        fileName = "Sheep.glb";
        scale = 0.15;
    } else if (type == 3) {
        fileName = "Cow.glb";
        scale = 0.15;
    } else if (type == 4) {
        fileName = "Wolf.glb";
        scale = 0.15;
    } else if (type == 5) {
        fileName = "Rhinoceros.glb";
        scale = 0.005;
    } else if (type == 6) {
        fileName = "Rhinoceros.glb";
        scale = 0.15;
    }
    SceneLoader.ImportMesh(
        "", "" + "./glb/", fileName,
        scene, function (newMeshes) {
            var mesh = newMeshes[0];
            Main.partsArray2.push(mesh);
            mesh.scaling = new Vector3(scale, scale, scale);
            var t = Main.getRand(1, Main.FirstTargetNums.length);
            var targetNum = Main.FirstTargetNums[t];
            const chip = Main.chipArray[targetNum];
            var p: Person = new Person(targetNum, chip.col, chip.row, type);
            p.setMesh(mesh);
            Main.persons.push(p);
            p.setMeshPosition(chip.col, chip.row, p.z);
        }
    );
}