import { _OcclusionDataStorage, AbstractMesh, SceneLoader, Axis, Space } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene.js";
import * as Main from './main.ts'
//import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
//import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import * as Item from './item.ts';
import * as Score from './score.ts';

export class Person {
    id: number;
    hashid: number;
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
    hp: number;
    maxHp: number;
    attack: number;
    defence: number;
    isAttack: boolean;
    isCreateObject: boolean;
    isPickObject: boolean;
    constructor(id: number, col: number, row: number, type: number) {
        this.id = id;
        this.hashid = Main.getRand(1, 9999);
        this.col = col;
        this.row = row;
        this.targetCol = col;
        this.targetRow = row;
        this.isTargetAvailable = false;
        this.type = type;
        this.direction = "n";
        if (type == 1) {
            this.tickId = Main.getRand(1, 30);
            this.isCreateObject = true;
            this.isPickObject = true;
            this.isAttack = true;
            this.hp = this.maxHp = 100;
            this.z = 0;
            this.attack = 1;
            this.defence = 1;
        } else {
            this.tickId = Main.getRand(10, 30);
            this.isCreateObject = false;
            this.isPickObject = false;
            this.hp = this.maxHp = 10;
            this.isAttack = false;
            this.z = 0.2;
            this.attack = 1;
            this.defence = 1;
        }
    }
    setMesh(mesh: AbstractMesh) {
        this.mesh = mesh;
        this.mesh?.rotate(Axis.Y, Math.PI / 2 * 2, Space.LOCAL);
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
        if (this.direction == "n") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * -2, Space.LOCAL);
        }
        if (this.direction == "s") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 0, Space.LOCAL);
        }
        if (this.direction == "w") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * -1, Space.LOCAL);
        }
        if (this.direction == "e") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * -3, Space.LOCAL);
        }

        this.direction = direction;
        if (this.direction == "n") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 2, Space.LOCAL);
        } else if (this.direction == "s") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 0, Space.LOCAL);
        } else if (this.direction == "w") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 1, Space.LOCAL);
        } else if (this.direction == "e") {
            this.mesh?.rotate(Axis.Y, Math.PI / 2 * 3, Space.LOCAL);
        }
    }

    watch() {
        var w = this.getObject(this.col + 1, this.row);
        var e = this.getObject(this.col - 1, this.row);
        var n = this.getObject(this.col, this.row + 1);
        var s = this.getObject(this.col, this.row - 1);
        return [w, e, n, s];
    }

    getObject(col: number, row: number) {
        //自分の上下左右に何があるのかを確認する
        for (var j = 0; j < Main.persons.length; j++) {
            if (Main.persons[j].col == col && Main.persons[j].row == row) {
                return Main.persons[j];
            }
        }
        for (var j = 0; j < Item.items.length; j++) {
            if (Item.items[j].col == col + 1 && Item.items[j].row == row) {
                return Item.items[j];
            }
        }
    }

    setMethod(o: Person | Item.Item | undefined): boolean {

        if (o == undefined) {
            return false;
        }

        if (o.constructor === Item.Item) {
            var a = this.getItem(o);
            return a;
        }
        if (o.constructor === Person) {
            var b = this.attackNPC(o);
            return b;
        }
        return false;
    }

    thinkAndAct(scene: Scene) {
        var eye = this.watch();
        //上下左右のどれかに対応する
        var isAction = false;
        for (var i = 0; i < 4; i++) {
            if (this.setMethod(eye[i]) == true) {
                isAction = true;
            }
        }
        if (this.isCreateObject == true && Score.TREE_AMOUNT >= 100) {
            this.build(scene, this.col, this.row);
            isAction = true;
        }
        if (isAction == false) {
            this.walk();
        }
    }

    getItem(i: Item.Item): boolean {
        //拾えるものは拾う
        if (i.isPick == true) {
            i.hp -= 5;
            return true;
        }
        //アップデートが必要な場合はアップデートする
        if (i.isPick == false && i.hp < i.maxHp) {
            i.hp += 5;
            return true;
        }
        return false;
    }

    attackNPC(p: Person): boolean {
        if (this.isAttack != true) return false;
        if (p.type != this.type) {
            p.hp -= 1;
            return true;
        }
        return false;
    }

    build(scene: Scene, col: number, row: number) {
        if (Score.TREE_AMOUNT > 100) {
            Score.updateTreeAmount(-100);
            //create tent
            Item.createItem(scene, 2, col, row);
        }
    }

    walk() {
        var speed = 1;
        if (this.mesh != undefined) {
            if (Main.orgFloor(this.mesh!.position.x, 1) < this.targetCol) {
                this.setMeshPosition(this.mesh!.position.x + speed, this.mesh!.position.z, this.z);
            }
            if (Main.orgFloor(this.mesh!.position.x, 1) > this.targetCol) {
                this.setMeshPosition(this.mesh!.position.x - speed, this.mesh!.position.z, this.z);
            }
            if (Main.orgFloor(this.mesh!.position.z, 1) < this.targetRow) {
                this.setMeshPosition(this.mesh!.position.x, this.mesh!.position.z + speed, this.z);
            }
            if (Main.orgFloor(this.mesh!.position.z, 1) > this.targetRow) {
                this.setMeshPosition(this.mesh!.position.x, this.mesh!.position.z - speed, this.z);
            }
            if (Main.orgFloor(this.mesh!.position.x, 1) == this.targetCol
                && Main.orgFloor(this.mesh!.position.z, 1) == this.targetRow
                //&& this.getIsTargetAvailable() == true && stepId % this.tickId == 0) {
                && this.getIsTargetAvailable() == true) {
                this.setIsTargetAvailable(false);
                this.col = this.targetCol;
                this.row = this.targetRow;
            }
        }
        if (this.getIsTargetAvailable() == false && Main.chipArray.length > 0) {
            var d = Main.getRand(1, 4);
            //マップデータと自分の位置情報を渡した上で、どの方向に進むべきかを考える
            var isSetTraget = false;
            //d = 2;
            if (d == 1) {
                //進めるかを確認する
                var isPass = Main.chkMapChip(this.hashid, this.targetCol + 1, this.targetRow, this.col, this.row);
                if (isPass == true) {
                    this.targetCol = this.targetCol + 1;
                    isSetTraget = true;
                    this.setDirection("e");
                }
            }
            if (d == 2) {
                var isPass = Main.chkMapChip(this.hashid, this.targetCol - 1, this.targetRow, this.col, this.row);
                if (isPass == true) {
                    this.targetCol = this.targetCol - 1;
                    isSetTraget = true;
                    this.setDirection("w");
                }
            }
            if (d == 3) {
                var isPass = Main.chkMapChip(this.hashid, this.targetCol, this.targetRow + 1, this.col, this.row);
                if (isPass == true) {
                    this.targetRow = this.targetRow + 1;
                    isSetTraget = true;
                    this.setDirection("n");
                }
            }
            if (d == 4) {
                var isPass = Main.chkMapChip(this.hashid, this.targetCol, this.targetRow - 1, this.col, this.row);
                if (isPass == true) {
                    this.targetRow = this.targetRow - 1;
                    isSetTraget = true;
                    this.setDirection("s");
                }
            }
            if (isSetTraget == true) {
                this.setIsTargetAvailable(true);
                isSetTraget = false;
            }
        }
    }

    remove() {
        if (this.type != 1) {
            Score.updateFoodAmount(100);
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
        scale = 0.5;
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
            Main.meshArray.push(mesh);
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