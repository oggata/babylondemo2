import { _OcclusionDataStorage } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene.js";
import * as Main from './main.ts'
import * as Item from './item.ts';
import * as MMap from './mmap.ts';
import * as Npc from './npc.ts'
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { MeshBuilder } from "@babylonjs/core/";

export function getMapData(id: number): any[] {
    if (id == 1) {
        return MMap.MAP_ARRAY2;
    } else if (id == 2) {
        return MMap.MAP_ARRAY2;
    } else if (id == 3) {
        return MMap.MAP_ARRAY3;
    } else if (id == 4) {
        return MMap.MAP_ARRAY4;
    } else if (id == 5) {
        return MMap.MAP_ARRAY5;
    } else if (id == 6) {
        return MMap.MAP_ARRAY6;
    } else if (id == 7) {
        return MMap.MAP_ARRAY7;
    } else if (id == 8) {
        return MMap.MAP_ARRAY8;
    } else if (id == 9) {
        return MMap.MAP_ARRAY9;
    } else {
        return MMap.MAP_ARRAY5;
    }
}

export function generateMap(scene: Scene) {
    var bid = 1;
    //1: 平地 2:道路 3:川 4:木
    const Material1 = new StandardMaterial("material", scene);
    Material1.diffuseColor = Color3.FromHexString('#4DA1A9');

    const Material2 = new StandardMaterial("material", scene);
    Material2.diffuseColor = Color3.FromHexString('#79D7BE');

    const Material3 = new StandardMaterial("material", scene);
    Material3.diffuseColor = Color3.Blue();
    Material3.diffuseColor = Color3.FromHexString('#FFF1DB');

    const Material4 = new StandardMaterial("material", scene);
    Material4.diffuseColor = Color3.FromHexString('#D4BDAC');

    const Material5 = new StandardMaterial("material", scene);
    Material5.diffuseColor = Color3.FromHexString('#E4F1AC');

    const Material6 = new StandardMaterial("material", scene);
    Material6.diffuseColor = Color3.FromHexString('#A7D477');

    const Material7 = new StandardMaterial("material", scene);
    Material7.diffuseColor = Color3.FromHexString('#62825D');

    const Material8 = new StandardMaterial("material", scene);
    Material8.diffuseColor = Color3.FromHexString('#3C552D');

    for (var row = 1; row <= Main.MAP_SIZE; row++) {
        for (var col = 1; col <= Main.MAP_SIZE; col++) {
            var num = Main.MAP_ARRAY[bid];
            var objectHight = num / 3;
            var box = MeshBuilder.CreateBox("box", { width: 1, height: objectHight, depth: 1 });
            Main.partsArray.push(box);
            box.position.x = col;
            box.position.z = row;
            box.position.y = objectHight / 2;
            const b = {
                id: 0,
                type: 0,
                h: 0,
                col: 0,
                row: 0
            };
            b.id = bid;
            b.type = num;
            b.col = col;
            b.row = row;
            b.h = objectHight;
            Main.chipArray.push(b);
            if (b.type == 1) {
                box.material = Material1;
            } else if (b.type == 2) {
                box.material = Material2;
            } else if (b.type == 3) {
                box.material = Material3;
            } else if (b.type == 4) {
                box.material = Material4;
            } else if (b.type == 5) {
                box.material = Material5;
            } else if (b.type == 6) {
                box.material = Material6;
            } else if (b.type == 7) {
                box.material = Material7;
            } else if (b.type == 8) {
                box.material = Material8;
            } else {
                box.material = Material3;
            }
            bid++;
        }
    }

    Main.setFirstTargetNums();

    for (var k = 0; k < Main.NPC_COUNT; k++) {
        Npc.createNPC(scene, 1);
    }
    for (var k = 0; k < Main.ENEMY_COUNT; k++) {
        Npc.createNPC(scene, 5);
        //Npc.createNPC(scene, 3);
        //Npc.createNPC(scene, 4);
    }
    for (var k = 0; k < Main.ITEM_COUNT; k++) {
        Item.createItem(scene, 1);
        Item.createItem(scene, 2);
        Item.createItem(scene, 3);
    }
}