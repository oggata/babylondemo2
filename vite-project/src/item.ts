import { _OcclusionDataStorage, AbstractMesh, SceneLoader } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene.js";
import * as Main from './main.ts'

export var items: Item[] = [];

export class Item {
    id: number;
    col: number;
    row: number;
    type: number;
    targetCol: number;
    targetRow: number;
    isTargetAvailable: boolean;
    mesh: AbstractMesh | undefined;
    constructor(id: number, col: number, row: number, type: number) {
        this.id = id;
        this.col = col;
        this.row = row;
        this.targetCol = col;
        this.targetRow = row;
        this.isTargetAvailable = false;
        this.type = type;
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
    setMeshPosition(col: number, row: number) {
        this.mesh!.position.x = col;
        this.mesh!.position.z = row;
        var c = Main.getChip(col, row);
        this.mesh!.position.y = c!.h + 1.2;
    }
}


export function resetItem() {
    items = [];
}

export function createItem(scene: Scene, type: number) {
    //var boxSize = { width: 0.8, height: 1.5, depth: 0.8 };
    var fileName = "Tree.glb";
    if (type == 2) {
        fileName = "Cottage.glb";
    }

    SceneLoader.ImportMesh(
        "", "" + "./glb/", fileName + "?" + type,
        scene, function (newMeshes) {
            var mesh = newMeshes[0];
            //var num = type;
            //mesh.scaling = new Vector3(0.3, 0.3, -0.3);
            //mesh.rotation = Vector3.Zero();
            if (mesh != undefined) {
                Main.partsArray2.push(mesh);
            }
            const targetNum = Main.getRand(1, Main.MAP_SIZE * Main.MAP_SIZE);
            const chip = Main.chipArray[targetNum];
            var i: Item = new Item(targetNum, chip.col, chip.row, 1);
            i.setMesh(mesh);
            i.setMeshPosition(chip.col, chip.row);
            items.push(i);
        }
    );

    /*
      var mesh = MeshBuilder.CreateBox("box", boxSize);
      //mesh.scaling = new Vector3(0.05, 0.05, -0.05);
      mesh.rotation = Vector3.Zero();
      partsArray.push(mesh);
      const Material1 = new StandardMaterial("material", scene);
      Material1.diffuseColor = Color3.FromHexString('#525B44');
      const Material2 = new StandardMaterial("material", scene);
      Material2.diffuseColor = Color3.FromHexString('#525B44');
      if (type == 1) {
        mesh.material = Material1;
      } else if (type == 2) {
        mesh.material = Material2;
      }
      //最初の場所
      const targetNum = getRand(1, MAP_SIZE * MAP_SIZE);
      const chip = chipArray[targetNum];
      var i: Item = new Item(targetNum, chip.col, chip.row, 1);
      i.setMesh(mesh);
    
      var c = getChip(chip.col, chip.row);
      var h = c!.type;
    
      mesh.position.x = chip.col;
      mesh.position.y = h / 3;
      mesh.position.z = chip.row;
      items.push(i);
    */
}