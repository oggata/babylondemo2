import "./style.css";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
//import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
//import { MeshLoader } from "@babylonjs/core/Meshes/MeshLoader.js";
import { _OcclusionDataStorage, AbstractMesh } from "@babylonjs/core";

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

function getRand(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from + 1));
};

//const BASE_URL = "https://cx20.github.io/gltf-test";

function orgFloor(value: number, base: number) {
  return Math.floor(value * base) / base;
}

var MAP_SIZE = 30;
var NPC_COUNT = 5;
var ENEMY_COUNT = 15;
var ITEM_COUNT = 20;
var MAP_ARRAY: any[] = [];
var MAP_ARRAY2 = [6, 6, 6, 5, 7, 2, 1, 4, 3, 1, 1, 3, 2, 7, 7, 3, 2, 4, 6, 5, 6, 5, 6, 7, 7, 5, 7, 4, 5, 1,
  3, 5, 6, 5, 5, 4, 4, 4, 4, 3, 4, 5, 4, 6, 7, 3, 4, 4, 5, 4, 4, 4, 5, 5, 4, 4, 4, 4, 4, 5,
  2, 3, 4, 4, 4, 4, 4, 5, 4, 5, 5, 5, 5, 6, 6, 3, 4, 4, 5, 4, 4, 3, 4, 5, 4, 4, 4, 3, 4, 3,
  4, 4, 4, 4, 4, 3, 4, 4, 3, 4, 5, 6, 5, 4, 4, 3, 4, 3, 4, 4, 5, 4, 4, 4, 4, 4, 5, 4, 5, 7,
  5, 5, 5, 5, 4, 3, 4, 3, 4, 4, 5, 6, 5, 4, 4, 3, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2,
  7, 4, 4, 5, 4, 4, 4, 4, 5, 4, 4, 6, 5, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 4, 4, 3, 2,
  4, 4, 3, 3, 4, 4, 4, 4, 6, 5, 5, 5, 4, 4, 4, 3, 4, 4, 5, 4, 4, 3, 4, 4, 4, 4, 4, 3, 4, 6,
  1, 4, 4, 4, 4, 4, 5, 5, 6, 4, 4, 4, 4, 4, 4, 3, 5, 4, 5, 4, 3, 4, 5, 4, 4, 3, 3, 3, 4, 5,
  1, 4, 5, 5, 4, 5, 5, 4, 5, 4, 4, 4, 4, 5, 4, 3, 6, 5, 4, 5, 4, 4, 4, 5, 4, 3, 3, 4, 5, 6,
  7, 6, 5, 4, 4, 5, 5, 4, 4, 3, 4, 3, 4, 4, 5, 3, 7, 6, 5, 4, 4, 3, 4, 4, 4, 4, 5, 5, 5, 3,
  5, 5, 4, 3, 3, 4, 4, 4, 4, 4, 4, 3, 4, 5, 6, 3, 8, 7, 6, 5, 3, 4, 4, 3, 4, 4, 5, 5, 5, 5,
  3, 4, 4, 4, 3, 4, 4, 4, 4, 4, 3, 4, 5, 4, 5, 3, 7, 6, 5, 4, 4, 3, 3, 4, 4, 3, 3, 4, 5, 7,
  2, 3, 4, 3, 3, 4, 5, 4, 5, 4, 4, 5, 6, 6, 6, 3, 6, 5, 4, 4, 4, 4, 5, 5, 4, 4, 4, 4, 5, 3,
  6, 4, 3, 4, 4, 5, 4, 4, 4, 4, 4, 4, 5, 5, 4, 3, 5, 5, 4, 4, 5, 4, 4, 4, 5, 5, 5, 6, 5, 4,
  3, 3, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 5, 4,
  2, 3, 4, 3, 4, 3, 4, 3, 4, 4, 3, 4, 4, 4, 3, 3, 5, 4, 4, 4, 4, 4, 5, 4, 4, 4, 5, 5, 5, 6,
  7, 4, 3, 3, 3, 4, 4, 3, 3, 4, 4, 4, 4, 4, 4, 3, 4, 4, 3, 3, 4, 5, 4, 4, 4, 4, 4, 4, 4, 2,
  4, 4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 5, 4, 3, 3, 4, 4, 3, 4, 4, 4, 3, 4, 3, 2,
  6, 5, 5, 4, 5, 4, 3, 3, 4, 4, 4, 4, 3, 3, 5, 3, 5, 5, 4, 3, 4, 4, 4, 4, 3, 4, 3, 3, 3, 1,
  5, 5, 4, 4, 4, 4, 4, 3, 4, 5, 5, 3, 3, 3, 4, 3, 5, 4, 4, 4, 4, 5, 4, 4, 4, 4, 3, 4, 4, 6,
  6, 4, 4, 5, 5, 6, 6, 5, 6, 6, 5, 3, 4, 3, 3, 3, 4, 4, 5, 4, 4, 5, 4, 4, 3, 4, 4, 4, 5, 7,
  5, 3, 4, 4, 4, 6, 6, 5, 5, 5, 5, 4, 4, 4, 3, 3, 5, 4, 5, 4, 4, 3, 3, 3, 4, 4, 5, 5, 5, 6,
  3, 3, 4, 3, 4, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 3, 5, 4, 4, 4, 4, 3, 4, 3, 4, 4, 5, 4, 3, 1,
  1, 3, 3, 3, 5, 4, 5, 4, 4, 4, 4, 4, 4, 5, 4, 3, 4, 4, 4, 4, 4, 4, 5, 4, 4, 4, 3, 2, 2, 2,
  2, 1, 2, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2,
  2, 4, 4, 5, 5, 4, 4, 4, 4, 5, 4, 5, 4, 5, 4, 3, 3, 4, 4, 3, 3, 4, 6, 5, 4, 4, 4, 4, 4, 3,
  6, 5, 4, 4, 5, 3, 3, 4, 4, 4, 4, 5, 4, 4, 5, 3, 4, 4, 4, 3, 4, 5, 6, 5, 4, 5, 5, 5, 4, 6,
  4, 5, 5, 5, 4, 3, 4, 4, 4, 3, 4, 4, 3, 3, 5, 3, 4, 5, 4, 4, 4, 5, 5, 5, 4, 5, 5, 4, 4, 7,
  7, 5, 5, 4, 4, 5, 4, 4, 3, 4, 4, 3, 3, 4, 5, 3, 5, 5, 5, 3, 2, 3, 3, 4, 5, 5, 4, 4, 3, 1,
  7, 1, 3, 2, 7, 7, 3, 5, 1, 6, 1, 3, 3, 5, 4, 3, 6, 6, 6, 2, 1, 3, 2, 1, 7, 6, 6, 5, 2, 6];
var MAP_ARRAY3 = [5, 2, 1, 4, 3, 1, 1, 3, 2, 5, 2, 4, 5, 3, 5, 4, 5, 1, 3, 5, 4, 2, 2, 5, 1, 5, 4, 3, 5, 2,
  4, 4, 5, 1, 4, 2, 4, 1, 5, 2, 5, 4, 1, 5, 5, 5, 5, 5, 4, 2, 5, 4, 4, 2, 1, 5, 2, 3, 4, 1,
  3, 4, 1, 2, 2, 1, 3, 2, 3, 3, 3, 5, 4, 4, 4, 3, 3, 5, 4, 5, 1, 5, 5, 5, 5, 3, 4, 3, 4, 1,
  4, 1, 1, 2, 2, 1, 1, 2, 2, 2, 1, 5, 3, 2, 2, 4, 1, 5, 4, 4, 2, 4, 5, 5, 2, 2, 4, 3, 4, 4,
  3, 3, 1, 4, 2, 4, 4, 1, 3, 3, 1, 4, 3, 5, 2, 2, 4, 4, 2, 2, 4, 2, 4, 4, 2, 1, 4, 2, 1, 2,
  3, 5, 4, 4, 2, 5, 4, 1, 2, 5, 3, 1, 5, 3, 1, 1, 5, 5, 1, 3, 1, 1, 3, 4, 5, 1, 3, 1, 1, 5,
  4, 1, 2, 3, 1, 2, 3, 5, 3, 5, 5, 3, 4, 1, 1, 4, 4, 4, 3, 3, 5, 4, 2, 4, 4, 3, 5, 3, 5, 3,
  2, 3, 1, 4, 2, 1, 5, 3, 1, 4, 4, 1, 1, 1, 5, 3, 5, 3, 1, 4, 5, 3, 4, 1, 4, 5, 4, 1, 3, 3,
  3, 5, 3, 1, 3, 4, 2, 3, 2, 2, 2, 3, 3, 2, 2, 3, 5, 3, 3, 1, 2, 5, 3, 2, 2, 4, 5, 2, 2, 3,
  3, 5, 2, 2, 5, 4, 5, 4, 1, 2, 5, 1, 4, 5, 1, 5, 1, 3, 3, 4, 1, 2, 5, 2, 3, 4, 3, 1, 4, 4,
  5, 2, 2, 3, 2, 2, 4, 5, 4, 2, 3, 2, 1, 2, 3, 3, 4, 2, 3, 2, 3, 2, 4, 5, 5, 5, 4, 5, 5, 5,
  3, 3, 1, 1, 2, 3, 5, 3, 1, 4, 2, 1, 3, 3, 3, 5, 2, 1, 5, 1, 1, 1, 2, 4, 4, 4, 5, 4, 1, 5,
  4, 2, 1, 5, 2, 2, 1, 4, 3, 5, 1, 1, 2, 3, 5, 2, 3, 1, 2, 4, 3, 3, 3, 5, 2, 1, 3, 3, 3, 2,
  3, 3, 3, 1, 5, 5, 4, 1, 4, 3, 2, 2, 1, 5, 2, 5, 3, 3, 5, 4, 5, 3, 3, 4, 1, 5, 4, 5, 1, 1,
  5, 5, 1, 3, 4, 4, 3, 2, 3, 3, 5, 4, 5, 4, 1, 2, 4, 3, 5, 1, 4, 5, 3, 5, 1, 1, 3, 5, 4, 2,
  4, 2, 1, 4, 1, 5, 3, 5, 3, 3, 3, 5, 2, 3, 5, 1, 1, 4, 4, 4, 5, 4, 1, 3, 3, 2, 3, 4, 1, 1,
  2, 3, 5, 2, 3, 4, 3, 2, 2, 1, 2, 2, 4, 4, 7, 7, 7, 7, 7, 1, 5, 1, 1, 1, 3, 4, 2, 4, 1, 2,
  3, 1, 3, 3, 3, 5, 1, 3, 2, 2, 4, 3, 3, 7, 7, 7, 7, 7, 7, 7, 3, 2, 4, 4, 1, 1, 1, 1, 2, 1,
  4, 1, 2, 1, 3, 1, 2, 1, 3, 2, 3, 3, 7, 7, 8, 3, 3, 1, 2, 2, 7, 4, 5, 1, 1, 4, 3, 4, 1, 2,
  1, 1, 2, 3, 2, 4, 2, 4, 1, 2, 2, 2, 2, 2, 1, 1, 2, 1, 8, 2, 7, 5, 5, 1, 1, 1, 1, 2, 1, 1,
  1, 1, 1, 1, 3, 1, 2, 3, 5, 1, 1, 1, 1, 1, 2, 3, 8, 3, 8, 2, 1, 1, 1, 1, 3, 1, 1, 1, 3, 2,
  1, 3, 3, 2, 4, 2, 2, 3, 3, 3, 5, 5, 1, 7, 8, 8, 8, 8, 8, 7, 3, 5, 1, 1, 1, 2, 4, 2, 3, 1,
  1, 3, 5, 3, 5, 2, 4, 2, 2, 1, 1, 3, 7, 7, 8, 8, 8, 8, 8, 3, 1, 2, 2, 1, 1, 1, 5, 2, 1, 1,
  2, 4, 1, 3, 1, 3, 4, 2, 5, 1, 2, 4, 5, 7, 7, 3, 7, 3, 7, 7, 4, 5, 2, 1, 3, 4, 1, 5, 2, 3,
  4, 4, 2, 5, 3, 3, 5, 1, 2, 1, 4, 2, 2, 2, 7, 7, 7, 7, 7, 2, 4, 1, 1, 2, 1, 1, 3, 3, 5, 4,
  1, 4, 2, 3, 5, 4, 4, 5, 1, 4, 1, 2, 2, 5, 4, 2, 4, 4, 3, 1, 5, 4, 3, 4, 1, 2, 4, 1, 5, 2,
  2, 1, 2, 5, 1, 1, 1, 5, 1, 5, 1, 4, 2, 4, 3, 2, 4, 2, 1, 2, 4, 3, 2, 2, 4, 5, 3, 2, 4, 1,
  3, 3, 5, 3, 3, 2, 4, 4, 2, 2, 1, 1, 5, 5, 2, 3, 2, 1, 3, 2, 3, 4, 4, 5, 1, 2, 5, 3, 1, 3,
  5, 1, 4, 5, 2, 1, 3, 2, 4, 4, 3, 2, 3, 5, 5, 4, 3, 4, 3, 2, 3, 5, 1, 5, 1, 5, 2, 4, 4, 4];
var MAP_ARRAY4 = [4, 4, 3, 3, 4, 4, 5, 5, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 6, 6, 5, 5, 4, 4, 3,
  4, 5, 3, 4, 5, 5, 5, 4, 3, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 5, 5, 5, 4, 2,
  3, 5, 3, 3, 5, 4, 5, 4, 4, 5, 5, 5, 6, 6, 5, 7, 7, 7, 7, 7, 7, 7, 6, 6, 7, 5, 4, 5, 3, 1,
  4, 5, 3, 3, 5, 3, 4, 5, 5, 4, 5, 4, 6, 6, 6, 7, 7, 6, 6, 7, 6, 7, 6, 6, 7, 6, 4, 4, 2, 1,
  5, 4, 4, 4, 5, 3, 5, 4, 5, 5, 5, 3, 6, 6, 6, 7, 6, 7, 5, 7, 5, 7, 5, 7, 7, 6, 5, 3, 1, 2,
  4, 3, 5, 5, 3, 5, 4, 5, 5, 5, 4, 5, 7, 6, 6, 7, 7, 5, 7, 5, 7, 6, 7, 7, 5, 6, 4, 2, 1, 3,
  3, 2, 4, 5, 3, 5, 4, 6, 4, 4, 4, 5, 6, 6, 5, 7, 7, 5, 7, 6, 6, 5, 6, 6, 5, 5, 3, 1, 2, 4,
  2, 1, 3, 5, 4, 5, 4, 7, 4, 5, 5, 5, 7, 5, 5, 7, 7, 5, 6, 6, 5, 4, 5, 5, 5, 4, 2, 1, 3, 5,
  1, 1, 2, 4, 5, 5, 3, 7, 5, 5, 5, 4, 6, 5, 5, 7, 6, 5, 6, 6, 5, 3, 5, 4, 4, 3, 1, 2, 4, 5,
  2, 2, 1, 3, 5, 6, 2, 7, 4, 4, 4, 4, 6, 5, 5, 7, 7, 5, 6, 5, 6, 3, 5, 3, 3, 2, 1, 3, 5, 4,
  3, 3, 1, 2, 5, 6, 2, 7, 3, 4, 5, 5, 5, 5, 5, 7, 7, 5, 5, 5, 6, 3, 5, 3, 2, 1, 2, 4, 5, 3,
  4, 4, 2, 1, 4, 5, 3, 6, 2, 5, 4, 5, 4, 4, 5, 6, 7, 6, 5, 5, 5, 3, 4, 3, 1, 1, 3, 5, 4, 2,
  5, 5, 3, 1, 3, 4, 3, 6, 3, 6, 5, 4, 4, 3, 4, 5, 6, 6, 5, 4, 4, 3, 3, 2, 1, 2, 4, 5, 3, 1,
  5, 5, 4, 2, 2, 3, 3, 5, 4, 6, 5, 3, 3, 2, 3, 4, 5, 5, 5, 3, 3, 3, 2, 1, 2, 3, 5, 4, 2, 1,
  4, 4, 5, 3, 1, 2, 3, 4, 5, 5, 4, 2, 2, 1, 2, 3, 4, 4, 4, 2, 2, 2, 1, 1, 3, 4, 5, 3, 1, 2,
  3, 3, 5, 4, 1, 1, 2, 3, 5, 4, 3, 1, 1, 1, 1, 2, 3, 3, 3, 1, 1, 1, 1, 2, 4, 5, 4, 2, 1, 3,
  2, 2, 4, 5, 2, 1, 1, 2, 4, 3, 2, 1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 3, 5, 5, 3, 1, 2, 4,
  1, 1, 3, 5, 3, 2, 1, 1, 3, 2, 1, 2, 3, 3, 2, 1, 1, 1, 1, 2, 3, 3, 3, 4, 5, 4, 2, 1, 3, 5,
  1, 1, 2, 4, 4, 3, 2, 1, 2, 1, 1, 3, 4, 4, 3, 2, 1, 2, 2, 3, 4, 4, 4, 5, 4, 3, 1, 2, 4, 5,
  2, 2, 1, 3, 5, 4, 3, 2, 1, 1, 2, 4, 5, 5, 4, 3, 2, 3, 3, 4, 5, 5, 5, 5, 3, 2, 1, 3, 5, 4,
  3, 3, 1, 2, 5, 5, 4, 3, 2, 2, 3, 5, 6, 6, 5, 4, 3, 4, 4, 5, 6, 6, 5, 4, 2, 1, 2, 4, 5, 3,
  4, 4, 2, 1, 4, 5, 5, 4, 3, 3, 4, 6, 7, 7, 6, 5, 4, 5, 5, 6, 7, 6, 4, 3, 1, 1, 3, 5, 4, 2,
  5, 5, 3, 1, 3, 4, 5, 5, 4, 4, 5, 7, 7, 7, 7, 6, 5, 6, 6, 7, 7, 5, 3, 2, 1, 2, 4, 5, 3, 1,
  5, 5, 4, 2, 2, 3, 4, 5, 5, 5, 6, 7, 7, 7, 7, 7, 6, 7, 7, 7, 6, 4, 2, 1, 2, 3, 5, 4, 2, 1,
  4, 4, 5, 3, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 5, 3, 1, 1, 3, 4, 5, 3, 1, 2,
  3, 3, 5, 4, 1, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 7, 6, 5, 4, 2, 1, 2, 4, 5, 4, 2, 1, 3,
  2, 2, 4, 5, 2, 1, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 6, 5, 4, 3, 1, 2, 3, 5, 5, 3, 1, 2, 4,
  1, 1, 3, 5, 3, 2, 1, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 5, 4, 3, 2, 1, 3, 4, 5, 4, 2, 1, 3, 5,
  1, 1, 2, 4, 4, 3, 2, 1, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 2, 4, 5, 4, 3, 1, 2, 4, 5];
var MAP_ARRAY5 = [4, 1, 8, 5, 1, 2, 5, 3, 3, 7, 8, 1, 5, 8, 4, 4, 1, 8, 6, 4, 3, 8, 1, 8, 3, 3, 2, 3, 7, 1, 8, 2, 2, 4, 3, 1, 1, 2, 2, 1, 3, 2, 2, 2, 3, 4, 2, 2, 6, 4, 6, 7, 2, 8, 2, 6, 5, 3, 8, 8, 3, 4, 3, 1, 1, 3, 1, 2, 1, 2, 1, 1, 1, 1, 4, 5, 4, 4, 1, 4, 5, 8, 8, 7, 6, 7, 6, 5, 8, 8, 2, 4, 5, 1, 3, 2, 1, 1, 2, 3, 2, 1, 1, 2, 2, 2, 2, 1, 2, 3, 2, 1, 3, 3, 7, 8, 7, 6, 8, 7, 8, 8, 5, 4, 4, 3, 4, 4, 2, 2, 2, 1, 1, 1, 3, 3, 2, 1, 1, 2, 3, 1, 2, 1, 8, 8, 8, 6, 1, 6, 3, 4, 4, 4, 5, 4, 3, 4, 1, 4, 3, 1, 2, 2, 3, 3, 2, 3, 3, 1, 3, 2, 3, 1, 1, 2, 3, 5, 5, 5, 8, 7, 6, 5, 4, 4, 4, 5, 2, 3, 3, 1, 2, 2, 3, 2, 2, 1, 3, 1, 1, 1, 2, 1, 2, 2, 3, 3, 2, 3, 2, 3, 7, 7, 7, 4, 5, 6, 5, 3, 4, 3, 2, 1, 4, 5, 3, 1, 2, 3, 3, 4, 3, 1, 1, 2, 1, 1, 2, 3, 1, 2, 3, 7, 6, 3, 4, 7, 7, 8, 3, 2, 1, 2, 1, 1, 1, 1, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 3, 2, 1, 2, 2, 1, 2, 5, 7, 7, 8, 8, 8, 2, 1, 1, 1, 1, 2, 2, 1, 3, 2, 1, 1, 1, 2, 1, 1, 2, 2, 5, 1, 3, 2, 8, 2, 3, 4, 6, 5, 8, 8, 3, 4, 3, 3, 2, 3, 2, 1, 2, 3, 1, 1, 1, 2, 2, 1, 1, 2, 5, 5, 6, 2, 7, 3, 2, 1, 5, 2, 7, 8, 2, 3, 2, 1, 1, 1, 3, 1, 2, 2, 3, 1, 1, 1, 1, 2, 2, 2, 7, 6, 6, 1, 7, 4, 3, 1, 1, 2, 6, 7, 1, 2, 2, 3, 2, 1, 2, 3, 2, 1, 4, 3, 3, 2, 2, 1, 2, 3, 4, 3, 3, 1, 8, 5, 3, 1, 1, 1, 5, 5, 1, 2, 1, 1, 1, 1, 2, 1, 1, 3, 4, 2, 1, 1, 2, 1, 1, 3, 4, 5, 7, 1, 8, 8, 8, 3, 2, 2, 5, 5, 1, 1, 2, 1, 2, 2, 3, 3, 1, 3, 3, 4, 1, 2, 1, 1, 1, 1, 2, 2, 6, 3, 6, 7, 6, 5, 4, 5, 5, 4, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 4, 4, 5, 3, 3, 3, 1, 2, 6, 3, 2, 7, 7, 3, 3, 4, 5, 4, 5, 5, 4, 2, 3, 3, 2, 2, 3, 1, 2, 1, 1, 5, 5, 5, 2, 3, 3, 3, 7, 4, 1, 7, 7, 6, 6, 4, 6, 6, 7, 5, 4, 6, 4, 2, 3, 2, 2, 2, 1, 2, 1, 1, 6, 6, 2, 1, 1, 1, 7, 4, 3, 8, 8, 8, 8, 3, 5, 2, 6, 5, 6, 6, 6, 3, 3, 3, 3, 3, 4, 4, 3, 2, 6, 6, 7, 1, 2, 2, 3, 4, 3, 3, 4, 4, 7, 7, 6, 6, 6, 6, 5, 5, 5, 2, 3, 2, 2, 3, 3, 3, 4, 3, 7, 7, 8, 8, 1, 3, 1, 3, 4, 3, 4, 5, 7, 7, 7, 8, 5, 6, 6, 6, 7, 1, 1, 2, 3, 3, 3, 2, 3, 1, 1, 2, 2, 1, 2, 4, 4, 3, 4, 3, 4, 5, 3, 8, 8, 7, 6, 6, 7, 6, 8, 1, 1, 1, 3, 2, 3, 2, 3, 2, 1, 2, 1, 1, 1, 3, 7, 6, 7, 8, 4, 3, 7, 6, 5, 6, 5, 5, 5, 5, 4, 2, 1, 3, 4, 5, 4, 3, 3, 1, 1, 3, 1, 1, 2, 4, 7, 6, 6, 6, 3, 4, 7, 6, 5, 7, 4, 5, 6, 5, 4, 2, 5, 6, 5, 5, 4, 3, 4, 1, 1, 2, 2, 1, 1, 1, 8, 5, 5, 7, 7, 3, 8, 6, 5, 5, 6, 6, 6, 6, 3, 3, 4, 5, 6, 3, 5, 4, 3, 1, 2, 1, 2, 1, 2, 2, 1, 1, 1, 1, 2, 8, 8, 7, 4, 6, 3, 7, 7, 6, 5, 5, 6, 5, 5, 6, 5, 4, 5, 6, 6, 6, 6, 7, 2, 2, 8, 8, 8, 8, 8, 8, 8, 7, 3, 2, 5, 7, 8, 7, 7, 6, 6, 6, 4, 3, 4, 5, 5, 6, 5, 6, 6, 5, 6, 1, 1, 8, 1, 3, 7, 7, 8, 7, 2, 1, 1, 1, 1, 2, 1, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 7, 5, 4, 7, 2, 7, 8, 7, 6, 7, 8, 8, 7, 6, 1, 1, 1, 2, 2, 1, 3, 2, 3, 2, 1, 4, 5, 5, 5, 4, 8, 5, 5, 8, 7, 7, 7, 6, 6, 7, 6, 8, 6, 7, 8, 7, 1, 1, 3, 4, 3, 3, 2, 3, 1, 1, 3, 5, 4, 5, 6, 5, 5, 8, 8];
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const openAIKey = "";

const llmchain_invoke = async (map_create_prompt: string) => {
  // OpenAIのモデルのインスタンスを作成
  const chatModel = new ChatOpenAI({
    openAIApiKey: openAIKey,
    model: "gpt-3.5-turbo"
  });

  // プロンプトのテンプレート文章を定義
  const template2 = `
  条件:
    あなたはRPGマップ生成の専門家です。自然で魅力的なマップを下記の条件で作成して、結果の配列だけを返してください。
    マップのサイズ:
      縦30*横30 合計900
    マップの高さ:
      1,2,3,4,5,6,7,8
    出力形式：
      マップの高さを配列で表現して出力してください 例[1,2,1,4,2,2,3,1,4]
      配列の順番は左上から右下に向かって順番に配列に入れる形式です。
    ルール：
      道路などは3のマップで作成してください。川や海などは3よりも低い高さ、つまり1か2として表現してください。 
      川の幅は1で、なるべく繋がるように考えて配置してください。
      デコボコとした起伏のあるようなマップにして欲しいのですが、
      プレイヤーは高さが1より高い差のあるマップには登れないため、なるべくなだらかに作成するようにしてください。
      マップの中に少なくとも一つは最大の高さが8になるような山を配置するようにしてください。
      山の形状は上から見たときに円を描くような形にしてください。
    その他の条件：{map_create_prompt}
`;

  // テンプレート文章にあるチェック対象の単語を変数化
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "あなたはRPGマップ生成の専門家です。自然で魅力的なマップを下記の条件で作成して、結果の配列だけを返してください。"],
    ["user", template2],
  ]);

  // チャットメッセージを文字列に変換するための出力解析インスタンスを作成
  const outputParser = new StringOutputParser();

  // OpenAIのAPIにこのプロンプトを送信するためのチェーンを作成
  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  // 関数を実行
  return await llmChain.invoke({
    map_create_prompt: map_create_prompt,
  });
};

var partsArray: { dispose: () => void; }[] | Mesh[] = [];
var chipArray: {
  id: number; type: number; col: number; row: number;
}[] = [];
var persons: Person[] = [];
var items: Item[] = [];

class Person {
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
}

class Item {
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
}

function createItem(scene: Scene, type: number) {
  var boxSize = { width: 0.8, height: 1.5, depth: 0.8 };
  var mesh = MeshBuilder.CreateBox("box", boxSize);
  //mesh.scaling = new Vector3(0.05, 0.05, -0.05);
  mesh.rotation = Vector3.Zero();
  partsArray.push(mesh);
  const Material1 = new StandardMaterial("material", scene);
  Material1.diffuseColor = Color3.Black();
  const Material2 = new StandardMaterial("material", scene);
  Material2.diffuseColor = Color3.Black();
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
}

function createNPC(scene: Scene, type: number) {
  var boxSize = { width: 0.2, height: 1, depth: 0.2 };
  var mesh = MeshBuilder.CreateBox("box", boxSize);
  //mesh.scaling = new Vector3(0.05, 0.05, -0.05);
  mesh.rotation = Vector3.Zero();
  partsArray.push(mesh);
  const Material1 = new StandardMaterial("material", scene);
  Material1.diffuseColor = Color3.White();
  const Material2 = new StandardMaterial("material", scene);
  Material2.diffuseColor = Color3.Red();
  if (type == 1) {
    mesh.material = Material1;
  } else if (type == 2) {
    mesh.material = Material2;
  }
  //最初の場所
  const targetNum = getRand(1, MAP_SIZE * MAP_SIZE);
  const chip = chipArray[targetNum];
  var p: Person = new Person(targetNum, chip.col, chip.row, type);
  p.setMesh(mesh);
  mesh.position.x = chip.col;
  mesh.position.y = 0;
  mesh.position.z = chip.row;
  //const Material = new StandardMaterial("material", scene);
  //Material.diffuseColor = Color3.Random();
  //mesh.material = Material;
  persons.push(p);
  /*
    SceneLoader.ImportMesh("", BASE_URL + "/sampleModels/Fox/glTF/", "Fox.gltf", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
      var mesh = newMeshes[0];
      mesh.scaling = new Vector3(0.05, 0.05, -0.05);
      mesh.rotation = Vector3.Zero();
      //最初の場所
      const targetNum = getRand(10, 500);
      const chip = chipArray[targetNum];
      //console.log("first target is [num:" + targetNum + "/col:" + chip.col + "/row:" + chip.row + "]");
      var p: Person = new Person(targetNum, chip.col, chip.row);
      p.setMesh(mesh);
      mesh.position.x = chip.col;
      mesh.position.z = chip.row;
      persons.push(p);
    });
    */
}

function resetMap(scene: Scene) {
  for (var i = 0; i < partsArray.length; i++) {
    partsArray[i].dispose();
  }
  partsArray = [];
  persons = [];

  var mapid = getRand(1, 5);
  if (mapid == 1) {
    MAP_ARRAY = MAP_ARRAY;
  } else if (mapid == 2) {
    MAP_ARRAY = MAP_ARRAY2;
  } else if (mapid == 3) {
    MAP_ARRAY = MAP_ARRAY3;
  } else if (mapid == 4) {
    MAP_ARRAY = MAP_ARRAY4;
  } else if (mapid == 5) {
    MAP_ARRAY = MAP_ARRAY5;
  }

  generateMap(scene);
};

function getChip(col: number, row: number) {
  for (var i = 0; i < chipArray.length; i++) {
    if (chipArray[i].col == col && chipArray[i].row == row) {
      return chipArray[i];
    }
  }
  return null;
}

function generateMap(scene: Scene) {
  var bid = 1;
  //1: 平地 2:道路 3:川 4:木
  const Material1 = new StandardMaterial("material", scene);
  Material1.diffuseColor = Color3.Green();
  const Material2 = new StandardMaterial("material", scene);
  Material2.diffuseColor = Color3.Gray();
  const Material3 = new StandardMaterial("material", scene);
  Material3.diffuseColor = Color3.Blue();
  const Material4 = new StandardMaterial("material", scene);
  Material4.diffuseColor = Color3.Yellow();
  //boxMaterial.diffuseColor = Color3.Random();
  for (var row = 1; row <= MAP_SIZE; row++) {
    for (var col = 1; col <= MAP_SIZE; col++) {
      var num = MAP_ARRAY[bid];
      var objectHight = num / 3;
      var box = MeshBuilder.CreateBox("box", { width: 1, height: objectHight, depth: 1 });
      partsArray.push(box);
      box.position.x = col;
      box.position.z = row;
      box.position.y = num / 6;
      const b = {
        id: 0,
        type: 0,
        col: 0,
        row: 0
      };;
      b.id = bid;
      b.type = num;
      b.col = col;
      b.row = row;
      chipArray.push(b);
      if (b.type == 1) {
        box.material = Material3;
      } else if (b.type == 2) {
        box.material = Material3;
      } else if (b.type == 3) {
        box.material = Material4;
      } else if (b.type == 4) {
        box.material = Material1;
      } else if (b.type == 5) {
        box.material = Material1;
      } else if (b.type == 6) {
        box.material = Material2;
      } else if (b.type == 7) {
        box.material = Material2;
      } else if (b.type == 8) {
        box.material = Material2;
      } else {
        box.material = Material1;
      }
      bid++;
    }
  }
  for (var k = 0; k < NPC_COUNT; k++) {
    createNPC(scene, 1);
  }
  for (var k = 0; k < ENEMY_COUNT; k++) {
    createNPC(scene, 2);
  }
  for (var k = 0; k < ITEM_COUNT; k++) {
    createItem(scene, 1);
  }
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
  var button1 = GUI.Button.CreateSimpleButton("but1", "Reset Map");
  button1.width = "100px"
  button1.height = "20px";
  button1.color = "white";
  button1.cornerRadius = 20;
  button1.background = "red";
  button1.onPointerUpObservable.add(function () {
    //alert("you did it!");
    resetMap(scene);
  });
  advancedTexture.addControl(button1);

  //地面
  var ground = Mesh.CreateGround("ground1", 2000, 2000, 2, scene);
  var material = new StandardMaterial("bookcase", scene);
  material.diffuseColor = new Color3(.2, .4, .5);
  ground.material = material
  ground.receiveShadows = true;
  ground.checkCollisions = true;

  console.log("LLM thinking..");
  var isLLMFlag = 0;
  if (isLLMFlag == 1) {
    //var aa = await llmchain_invoke("マップサイズ : " + MAP_SIZE + "x" + MAP_SIZE + "");
    var aa = await llmchain_invoke("");
    MAP_ARRAY = aa.split(',');
  } else {
    var mapid = getRand(1, 5);
    if (mapid == 1) {
      MAP_ARRAY = MAP_ARRAY;
    } else if (mapid == 2) {
      MAP_ARRAY = MAP_ARRAY2;
    } else if (mapid == 3) {
      MAP_ARRAY = MAP_ARRAY3;
    } else if (mapid == 4) {
      MAP_ARRAY = MAP_ARRAY4;
    } else if (mapid == 5) {
      MAP_ARRAY = MAP_ARRAY4;
    }
  }
  console.log("LENGTH : " + MAP_ARRAY.length);
  console.log(MAP_ARRAY);
  resetMap(scene);

  var stepId = 0;
  setInterval(function () {
    for (var j = 0; j < persons.length; j++) {
      var speed = 1;
      if (persons[j].mesh != undefined) {
        if (orgFloor(persons[j].mesh!.position.x, 1) < persons[j].targetCol) {
          persons[j].mesh!.position.x += speed;
          var c = getChip(persons[j].targetCol, persons[j].targetRow);
          var h = c!.type;
          persons[j].mesh!.position.y = h / 3;
          //persons[j].mesh.rotate(new Vector3(persons[j].mesh.position.x, persons[j].mesh.position.y, persons[j].mesh.position.z), Math.PI / 180 * 90, Space.LOCAL);
        }
        if (orgFloor(persons[j].mesh!.position.x, 1) > persons[j].targetCol) {
          persons[j].mesh!.position.x -= speed;
          var c = getChip(persons[j].targetCol, persons[j].targetRow);
          var h = c!.type;
          persons[j].mesh!.position.y = h / 3;
        }
        if (orgFloor(persons[j].mesh!.position.z, 1) < persons[j].targetRow) {
          persons[j].mesh!.position.z += speed;
          var c = getChip(persons[j].targetCol, persons[j].targetRow);
          var h = c!.type;
          persons[j].mesh!.position.y = h / 3;
        }
        if (orgFloor(persons[j].mesh!.position.z, 1) > persons[j].targetRow) {
          persons[j].mesh!.position.z -= speed;
          var c = getChip(persons[j].targetCol, persons[j].targetRow);
          var h = c!.type;
          persons[j].mesh!.position.y = h / 3;
        }
        if (orgFloor(persons[j].mesh!.position.x, 1) == persons[j].targetCol
          && orgFloor(persons[j].mesh!.position.z, 1) == persons[j].targetRow
          && persons[j].getIsTargetAvailable() == true) {
          persons[j].setIsTargetAvailable(false);
          persons[j].col = persons[j].targetCol;
          persons[j].row = persons[j].targetRow;
          var c = getChip(persons[j].targetCol, persons[j].targetRow);
          var h = c!.type;
          persons[j].mesh!.position.y = h / 3;
        }
      }
      //console.log(persons[j].col + "-" + persons[j].row + "/" + persons[j].targetCol + "-" + persons[j].targetRow + " " + persons[j].isTargetAvailable);
      if (persons[j].getIsTargetAvailable() == false && chipArray.length > 0) {
        //Agentに移動の目的を伝える

        //マップデータと自分の位置情報を渡した上で、どの方向に進むべきかを考える
        var d = getRand(1, 4);
        //console.log("direction>" + d);
        var isSetTraget = false;
        if (d == 1) {
          //進めるかを確認する
          var isPass = chkMapChip(persons[j].targetCol + 1, persons[j].targetRow, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetCol = persons[j].targetCol + 1;
            isSetTraget = true;
          }
        }
        if (d == 2) {
          var isPass = chkMapChip(persons[j].targetCol - 1, persons[j].targetRow, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetCol = persons[j].targetCol - 1;
            isSetTraget = true;
          }
        }
        if (d == 3) {
          var isPass = chkMapChip(persons[j].targetCol, persons[j].targetRow + 1, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetRow = persons[j].targetRow + 1;
            isSetTraget = true;
          }
        }
        if (d == 4) {
          var isPass = chkMapChip(persons[j].targetCol, persons[j].targetRow - 1, persons[j].col, persons[j].row);
          if (isPass == true) {
            persons[j].targetRow = persons[j].targetRow - 1;
            isSetTraget = true;
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
            console.log("eat");
          }
        }
      }
    }

    for (var i = 0; i < persons.length; i++) {
      for (var j = 0; j < items.length; j++) {
        if (persons[i].col == items[j].col && persons[i].row == items[j].row) {
          items[j].mesh?.dispose();
          items.splice(j, 1);
          console.log("tree");
        }
      }
    }

    stepId++;
    /*
    if (stepId == 1) {
      resetMap(scene);
    }*/
  }, 1000);

  // Run render loop
  babylonEngine.runRenderLoop(() => {
    scene.render();
  });
}

main();