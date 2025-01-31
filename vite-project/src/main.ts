import "./style.css";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
//import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
//import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
//import { MeshLoader } from "@babylonjs/core/Meshes/MeshLoader.js";
import { _OcclusionDataStorage, AbstractMesh, SceneLoader, Axis, Space } from "@babylonjs/core";

import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
//import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience.js";
//import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
// Required for EnvironmentHelper
import "@babylonjs/core/Materials/Textures/Loaders";

// Enable GLTF/GLB loader for loading controller models from WebXR Input registry
import "@babylonjs/loaders/glTF";

// Without this next import, an error message like this occurs loading controller models:
//  Build of NodeMaterial failed" error when loading controller model
//  Uncaught (in promise) Build of NodeMaterial failed: input rgba from block
//  FragmentOutput[FragmentOutputBlock] is not connected and is not optional.
import "@babylonjs/core/Materials/Node/Blocks";

// XR ボタンを右下に表示させるために必須
import "@babylonjs/core/Helpers/sceneHelpers";

import * as Map from './map.ts';
import * as Agent from './agent.ts';
import * as Item from './item.ts';
//import * as NPC from './npc.ts';

export function getRand(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from + 1));
};

export function orgFloor(value: number, base: number) {
  return Math.floor(value * base) / base;
}
var SCORE = 0;
export var MAP_SIZE = 30;
export var NPC_COUNT = 8;
export var ENEMY_COUNT = 18;
export var ITEM_COUNT = 18;
export var MAP_ARRAY: any[] = [];

export var partsArray: { dispose: () => void; }[] | Mesh[] = [];
export var partsArray2: { dispose: () => void; }[] | AbstractMesh[] = [];
export var chipArray: {
  id: number; type: number; col: number; row: number; h: number;
}[] = [];
export var persons: Person[] = [];


class Person {
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

  constructor(id: number, col: number, row: number, type: number) {
    this.id = id;
    this.col = col;
    this.row = row;
    this.targetCol = col;
    this.targetRow = row;
    this.isTargetAvailable = false;
    this.type = type;
    this.direction = "n";
    if (type == 1) {
      this.tickId = getRand(1, 10);
    } else {
      this.tickId = getRand(10, 20);
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
  setMeshPosition(col: number, row: number) {
    this.mesh!.position.x = col;
    this.mesh!.position.z = row;
    var c = getChip(col, row);
    this.mesh!.position.y = c!.h + 0.2;
  }
  setDirection(direction: string) {
    //console.log(this.mesh?.getDirectionToRef);
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

var FirstTargetNums: any[] = [];

export function setFirstTargetNums() {
  for (var i = 0; i < chipArray.length; i++) {
    if (chipArray[i].type > 2) {
      FirstTargetNums.push(i);
    }
  }
}


export function createNPC(scene: Scene, type: number) {
  //var boxSize = { width: 0.2, height: 1, depth: 0.2 };
  //var mesh = MeshBuilder.CreateBox("box", boxSize);
  //var animForward: AnimationGroup;

  var fileName = "Animated_Human.glb";
  if (type == 2) {
    fileName = "Sheep.glb";
  }

  SceneLoader.ImportMesh(
    "", "" + "./glb/", fileName,
    scene, function (newMeshes) {
      var mesh = newMeshes[0];
      //var walkAnimation = scene.getAnimationGroupByName("Run");
      //walkAnimation?.start();
      mesh.scaling = new Vector3(0.15, 0.15, 0.15);
      mesh.rotation = Vector3.Zero();
      partsArray2.push(mesh);
      const Material1 = new StandardMaterial("material", scene);
      Material1.diffuseColor = Color3.White();
      const Material2 = new StandardMaterial("material", scene);
      Material2.diffuseColor = Color3.Red();
      if (type == 1) {
        mesh.material = Material1;
        mesh.scaling = new Vector3(0.15, 0.15, 0.15);
      } else if (type == 2) {
        mesh.material = Material2;
        mesh.scaling = new Vector3(0.6, 0.6, 0.6);
      }

      var t = getRand(1, FirstTargetNums.length);
      var targetNum = FirstTargetNums[t];
      const chip = chipArray[targetNum];

      var p: Person = new Person(targetNum, chip.col, chip.row, type);
      p.setMesh(mesh);
      persons.push(p);
      p.setMeshPosition(chip.col, chip.row);
    }
  );
}
var mapid = 1;
function resetMap(scene: Scene) {
  for (var i = 0; i < partsArray.length; i++) {
    partsArray[i].dispose();
  }
  for (var i = 0; i < partsArray2.length; i++) {
    partsArray2[i].dispose();
  }
  partsArray = [];
  partsArray2 = [];
  persons = [];
  Item.resetItem();
  chipArray = [];
  mapid++;
  if (mapid > 9) {
    mapid = 1;
  }
  MAP_ARRAY = Map.getMapData(1);
  Map.generateMap(scene);
};

export function getChip(col: number, row: number) {
  for (var i = 0; i < chipArray.length; i++) {
    if (chipArray[i].col == col && chipArray[i].row == row) {
      return chipArray[i];
    }
  }
  return null;
}

function chkMapChip(col: number, row: number, col2: number, row2: number) {
  //範囲外ではないか
  if (col < 0 || MAP_SIZE < col || row < 0 || MAP_SIZE < row) {
    return false;
  }
  //通行できるか
  //今の高さより高いかを調べる
  var cp = getChip(col, row);
  var cp2 = getChip(col2, row2);
  if (cp != null && cp2 != null) {
    if (cp?.type <= 2) {
      return false;
    }
    if (cp?.type <= cp2.type + 1) {
      return true;
    }
    return false;
  }
}

const main = async () => {

  const app = document.querySelector<HTMLDivElement>("body");
  const canvas = document.createElement("canvas");
  app?.appendChild(canvas);

  // Create engine and a scene
  const babylonEngine = new Engine(canvas, true);
  const scene = new Scene(babylonEngine);

  // Add a basic light
  new HemisphericLight("light1", new Vector3(0, 0.1, 0), scene);

  // Add a camera for the non-VR view in browser
  const camera = new ArcRotateCamera("Camera", -(Math.PI / 4) * 3, Math.PI / 4, 40, new Vector3(5, 4, 2), scene);
  camera.attachControl(true);

  // GUI
  var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  /*
  var scoreBlock = new GUI.TextBlock();
  scoreBlock.text = SCORE + "pt";
  scoreBlock.fontSize = 12;
  scoreBlock.top = 220;
  //scoreBlock.left = -150;
  scoreBlock.color = "black";
  advancedTexture.addControl(scoreBlock);
  */

  /*
  var button1 = GUI.Button.CreateSimpleButton("but", "GenerateMap");
  button1.width = "60px"
  button1.height = "20px";
  button1.color = "white";
  button1.top = 200;
  button1.cornerRadius = 10;
  button1.background = "black";
  button1.onPointerUpObservable.add(function () {
    //alert("you did it!");
    resetMap(scene);
  });
  */

  var button2 = GUI.Button.CreateSimpleButton("but", "GenerateMap");
  button2.width = "200px"
  button2.height = "20px";
  button2.color = "white";
  button2.top = 200;
  button2.cornerRadius = 5;
  button2.background = "black";
  button2.onPointerUpObservable.add(function () {
    //alert("you did it!");
    resetMap(scene);
  });
  //advancedTexture.addControl(button1);
  advancedTexture.addControl(button2);

  //地面
  var ground = Mesh.CreateGround("ground1", 2000, 2000, 2, scene);
  var material = new StandardMaterial("bookcase", scene);
  //material.diffuseColor = Color3.White();
  material.diffuseColor = Color3.FromHexString('#FBFBFB');
  ground.material = material
  //ground.receiveShadows = true;
  //ground.checkCollisions = true;

  console.log("LLM thinking..");
  var isLLMFlag = 0;
  if (isLLMFlag == 1) {
    var map = await Agent.generateMapCoordinate("");
    MAP_ARRAY = map.split(',');
  } else {
    var mapid = getRand(1, 5);
    MAP_ARRAY = Map.getMapData(mapid);
  }
  resetMap(scene);

  var stepId = 0;
  setInterval(function () {
    for (var j = 0; j < persons.length; j++) {
      var speed = 1;
      if (persons[j].mesh != undefined) {
        if (orgFloor(persons[j].mesh!.position.x, 1) < persons[j].targetCol) {
          persons[j].setMeshPosition(persons[j].mesh!.position.x + speed, persons[j].mesh!.position.z);
        }
        if (orgFloor(persons[j].mesh!.position.x, 1) > persons[j].targetCol) {
          persons[j].setMeshPosition(persons[j].mesh!.position.x - speed, persons[j].mesh!.position.z);
        }
        if (orgFloor(persons[j].mesh!.position.z, 1) < persons[j].targetRow) {
          persons[j].setMeshPosition(persons[j].mesh!.position.x, persons[j].mesh!.position.z + speed);
        }
        if (orgFloor(persons[j].mesh!.position.z, 1) > persons[j].targetRow) {
          persons[j].setMeshPosition(persons[j].mesh!.position.x, persons[j].mesh!.position.z - speed);
        }
        if (orgFloor(persons[j].mesh!.position.x, 1) == persons[j].targetCol
          && orgFloor(persons[j].mesh!.position.z, 1) == persons[j].targetRow
          && persons[j].getIsTargetAvailable() == true && stepId % persons[j].tickId == 0) {
          persons[j].setIsTargetAvailable(false);
          persons[j].col = persons[j].targetCol;
          persons[j].row = persons[j].targetRow;
        }
      }
      if (persons[j].getIsTargetAvailable() == false && chipArray.length > 0) {
        //Agentに移動の目的を伝える

        //自分の前後左右のデータを取得する
        /*
          0,0,0,
          0,0,0,
          0,0,0,
        */
        /*
         //var type1 = getObjectType(persons[j].col - 1, persons[j].row + 1);
         var type2 = getObjectType(persons[j].col + 0, persons[j].row + 1);
         //var type3 = getObjectType(persons[j].col + 1, persons[j].row + 1);
         var type4 = getObjectType(persons[j].col - 1, persons[j].row + 0);
         var type5 = getObjectType(persons[j].col + 1, persons[j].row + 0);
         //var type6 = getObjectType(persons[j].col - 1, persons[j].row - 1);
         var type7 = getObjectType(persons[j].col + 0, persons[j].row - 1);
         //var type8 = getObjectType(persons[j].col + 1, persons[j].row - 1);
         */
        var d = getRand(1, 4);
        //マップデータと自分の位置情報を渡した上で、どの方向に進むべきかを考える
        var isSetTraget = false;
        if (d == 1) {
          //進めるかを確認する
          var isPass = chkMapChip(persons[j].targetCol + 1, persons[j].targetRow, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetCol = persons[j].targetCol + 1;
            isSetTraget = true;
            persons[j].setDirection("e");
          }
        }
        if (d == 2) {
          var isPass = chkMapChip(persons[j].targetCol - 1, persons[j].targetRow, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetCol = persons[j].targetCol - 1;
            isSetTraget = true;
            persons[j].setDirection("w");
          }
        }
        if (d == 3) {
          var isPass = chkMapChip(persons[j].targetCol, persons[j].targetRow + 1, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetRow = persons[j].targetRow + 1;
            isSetTraget = true;
            persons[j].setDirection("n");
          }
        }
        if (d == 4) {
          var isPass = chkMapChip(persons[j].targetCol, persons[j].targetRow - 1, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetRow = persons[j].targetRow - 1;
            isSetTraget = true;
            persons[j].setDirection("s");
          }
        }
        if (isSetTraget == true) {
          persons[j].setIsTargetAvailable(true);
          isSetTraget = false;
        }
      }
      //console.log("step:" + stepId + "/" + persons[j].getIsTargetAvailable() + "/x:" + persons[j].mesh.position.x + "/col:" + persons[j].col + "/tcol:" + persons[j].targetCol + "/y:" + persons[j].mesh.position.y + "/row:" + persons[j].row + "/trow:" + persons[j].targetRow);
    }

    for (var i = 0; i < persons.length; i++) {
      for (var j = 0; j < persons.length; j++) {
        if (persons[i].type == 1 && persons[j].type == 2) {
          if (persons[i].col == persons[j].col && persons[i].row == persons[j].row) {
            persons[j].mesh?.dispose();
            persons.splice(j, 1);
            //console.log("eat");
            SCORE + 10;
          }
        }
      }
    }

    for (var i = 0; i < persons.length; i++) {
      for (var j = 0; j < Item.items.length; j++) {
        if (persons[i].col == Item.items[j].col && persons[i].row == Item.items[j].row) {
          Item.items[j].mesh?.dispose();
          Item.items.splice(j, 1);
          //console.log("tree");
          SCORE + 1;
        }
      }
    }
    stepId++;
    /*
        var run: Nullable<AnimationGroup>;
        if (stepId == 1) {
          run = scene.getAnimationGroupByName("Run");
        }
        if (stepId % 15 == 0) {
          //const run = scene.getAnimationGroupByName("Run");
          console.log(">>");
          console.log(run);
          scene.onBeforeRenderObservable.add(() => {
            //character.moveWithCollisions(character.forward.scaleInPlace(1.05));
            if (run != null) {
              run!.start(true, 1.6, run!.from, run!.to, false);
            }
          });
        }
    */
    //scoreBlock.text = SCORE + "pt";
  }, 30);



  /*
  var walkAnimation;
  if (stepId == 60) {
    walkAnimation = scene.getAnimationGroupByName("Run");
  }
  if (stepId > 70 && stepId % 35 == 0) {
    if (walkAnimation != null) {
      walkAnimation.start(true, 1.0, walkAnimation.from, walkAnimation.to, true);
    }
  }*/

  //scene.onBeforeRenderObservable.add(() => {
  //walkAnimation.start(true, 1.0, walkAnimation.from, walkAnimation.to, true);



  //});
  //});

  // Run render loop
  babylonEngine.runRenderLoop(() => {
    scene.render();
  });


}



main();