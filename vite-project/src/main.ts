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
import * as NPC from './npc.ts';
import * as Score from './score.ts';

export var MAP_SIZE = 30;
export var NPC_COUNT = 5;
export var ENEMY_COUNT = 5;
export var ITEM_COUNT = 10;
export var MAP_ARRAY: any[] = [];

export var boxArray: { dispose: () => void; }[] | Mesh[] = [];
export var meshArray: { dispose: () => void; }[] | AbstractMesh[] = [];
export var chipArray: {
  id: number; type: number; col: number; row: number; h: number;
}[] = [];
export var persons: NPC.Person[] = [];
export var FirstTargetNums: any[] = [];

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
  var scoreBlock = new GUI.TextBlock();
  scoreBlock.text = "";
  scoreBlock.fontSize = 12;
  scoreBlock.top = 220;
  //scoreBlock.left = -150;
  scoreBlock.color = "black";
  advancedTexture.addControl(scoreBlock);

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
  material.diffuseColor = Color3.FromHexString('#FBFBFB');
  ground.material = material

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
    var humanCount = 0;
    var enemyCount = 0;
    for (var j = 0; j < persons.length; j++) {
      if (persons[j].type == 1) {
        humanCount++;
      }
      if (persons[j].type == 2) {
        enemyCount++;
      }
      if (stepId == persons[j].tickId) {
        //特定のtickの時だけ呼び出す
        persons[j].thinkAndAct(scene);
      }
      if (persons[j].hp < 0) {
        persons[j].mesh?.dispose();
        persons.splice(j, 1);
      }
    }
    Score.setPopulation(humanCount);
    for (var j = 0; j < Item.items.length; j++) {
      if (Item.items[j].hp < 0) {
        Item.items[j].remove();
        Item.items[j].mesh?.dispose();
        Item.items.splice(j, 1);
      }
    }
    stepId++;
    if (stepId > 30) {
      stepId = 0;
    }
    var text = Score.getScoreText();
    scoreBlock.text = text;
  }, 30);

  // Run render loop
  babylonEngine.runRenderLoop(() => {
    scene.render();
  });
}

export function getRand(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from + 1));
};

export function orgFloor(value: number, base: number) {
  return Math.floor(value * base) / base;
}

var mapid = 1;
function resetMap(scene: Scene) {
  for (var i = 0; i < boxArray.length; i++) {
    boxArray[i].dispose();
  }
  for (var i = 0; i < meshArray.length; i++) {
    meshArray[i].dispose();
  }
  boxArray = [];
  meshArray = [];
  persons = [];
  Item.resetItem();
  chipArray = [];
  mapid++;
  if (mapid > 9) {
    mapid = 1;
  }
  MAP_ARRAY = Map.getMapData(mapid);
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

export function chkMapChip(hashid: number, col: number, row: number, col2: number, row2: number) {
  //範囲外ではないか
  if (col < 0 || MAP_SIZE < col || row < 0 || MAP_SIZE < row) {
    return false;
  }
  //他のオブジェクトとかぶっていないか？
  for (var j = 0; j < Item.items.length; j++) {
    if (col == Item.items[j].col && row == Item.items[j].row) {
      return false;
    }
  }
  for (var j = 0; j < persons.length; j++) {
    if (col == persons[j].col && row == persons[j].row && hashid != persons[j].hashid) {
      return false;
    }
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

export function setFirstTargetNums() {
  for (var i = 0; i < chipArray.length; i++) {
    if (chipArray[i].type > 2) {
      FirstTargetNums.push(i);
    }
  }
}

main();