import { _OcclusionDataStorage, AbstractMesh, SceneLoader } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene.js";
import * as Main from './main.ts'
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import * as Score from './score.ts';

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
    hp: number;
    maxHp: number;
    isPick: boolean;
    isAttackByNPC: boolean = false;

    constructor(id: number, col: number, row: number, type: number) {
        this.id = id;
        this.col = col;
        this.row = row;
        this.targetCol = col;
        this.targetRow = row;
        this.isTargetAvailable = false;
        this.type = type;
        this.hp = this.maxHp = 100;
        //tree
        if (type == 1) {
            this.isPick = true;
        } else if (type == 2) {
            this.isPick = false;
        } else {
            this.isPick = false;
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
    remove() {
        if (this.type == 1) {
            Score.updateTreeAmount(100);
        } else if (this.type == 2) {

        }
    }
}


export function resetItem() {
    items = [];
}

export function createItem(scene: Scene, type: number, col?: number, row?: number) {
    //var boxSize = { width: 0.8, height: 1.5, depth: 0.8 };
    var fileName = "Tree.glb";
    var scale = 1;
    var z = 1.2;
    if (type == 1) {
        fileName = "Tree.glb";
        scale = 1;
        z = 1.2;
    } else if (type == 2) {
        fileName = "Tent.glb";
        scale = 0.5;
        z = 0.2;
    } else if (type == 3) {
        fileName = "Campfire.glb";
        scale = 0.3;
        z = 0.2;
    } else if (type == 4) {
        fileName = "Campfire.glb";
        scale = 0.3;
        z = 0.2;
    } else if (type == 5) {
        fileName = "Campfire.glb";
        scale = 0.3;
        z = 0.2;
    }

    SceneLoader.ImportMesh(
        "", "" + "./glb/", fileName + "?" + type,
        scene, function (newMeshes) {
            var mesh = newMeshes[0];
            //var num = type;
            mesh.scaling = new Vector3(scale, scale, scale * -1);
            //mesh.rotation = Vector3.Zero();
            if (mesh != undefined) {
                Main.meshArray.push(mesh);
            }
            var targetNum = 1;
            var _col: number;
            var _row: number;
            if (col == null || row == null) {
                targetNum = Main.getRand(1, Main.MAP_SIZE * Main.MAP_SIZE);
                const chip = Main.chipArray[targetNum];
                _col = chip.col;
                _row = chip.row;
            } else {
                _col = col;
                _row = row;
            }
            var i: Item = new Item(targetNum, _col, _row, type);
            i.setMesh(mesh);
            i.setMeshPosition(_col, _row, z);
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


export function getItems(col: number, row: number) {

}