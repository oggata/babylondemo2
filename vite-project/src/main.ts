import "./style.css";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
//import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
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

function getRand(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from + 1));
};

function orgFloor(value: number, base: number) {
  return Math.floor(value * base) / base;
}

var MAP_SIZE = 30;
var NPC_COUNT = 10;
var ENEMY_COUNT = 15;
var ITEM_COUNT = 15;
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

const generateMapCoordinate = async (map_create_prompt: string) => {

  const chatModel = new ChatOpenAI({
    openAIApiKey: openAIKey,
    model: "gpt-3.5-turbo"
  });

  // プロンプトのテンプレート文章を定義
  const template = `
  条件:
    マップのサイズ:
      縦30*横30 合計900
    マップの高さ:
      1,2,3,4,5,6,7,8
    出力形式：
      マップの高さを配列で表現して出力してください 例[1,2,1,4,2,2,3,1,4]
      配列の順番は左上から右下に向かって順番に配列に入れる形式を取ります。
    ルール：
      平均的な高さは3として、道路などは3のマップで作成してください。
      川や海などは3よりも低い高さ、つまり1か2として表現します。
      また、川の幅は1で、なるべく繋がるように考えて配置してください。
      起伏のあるようなマップにして欲しいのですが、プレイヤーは、マップの高さの差が1より大きいマップには登れないため、なるべくなだらかに作成するようにしてください。
      マップの中に少なくとも一つは最大の高さが8になるような山を配置するようにしてください。
      山の形状は上から見たときになるべく円を描くような形にしてください。
    その他の条件：{map_create_prompt}
`;

  // テンプレート文章にあるチェック対象の単語を変数化
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "あなたはRPGマップ生成の専門家です。自然で魅力的なマップを下記の条件で作成して、結果の配列だけを返してください。"],
    ["user", template],
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

/*
const llmchain_invoke2 = async (map_create_prompt: string) => {
  // OpenAIのモデルのインスタンスを作成
  const chatModel = new ChatOpenAI({
    openAIApiKey: openAIKey,
    model: "gpt-3.5-turbo"
  });

  const template = `
  条件:
      あなたはゲームのNPCです。あらかじめ与えられたマップの条件と、視野を元に、東西南北のどの方向に
      進めば良いかを意思決定してください。
      基本的なロジックは、プレイヤーが視野に入るまでは巡回行動を取ります。
      一定の区間を巡回するように動いてください。
      プレイヤーが視野に入った場合、プレイヤーを追いかけるような行動を取ってください。
    ルール：
      視野から得られる情報は、自分から見て東西南北にあるオブジェクトの情報を配列にしたものです。
      9の番号が自分の位置です。
      [
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,9,0,0,
        0,0,0,0,0,
        0,0,0,0,0
      ]

      視野の番号と行いたい行動についてはこちらになります。
      0:何もない
      1:猪  プレイヤーと重なると飢えを回復することができるので、追いかけてください
      2:熊  プレイヤーと重なるとプレイヤーは死亡します。逃げてください。
      3:木  木材となります。木材を使って家をつくれるので、追いかけてください。
      9:自分の位置

      また結果として返してほしい数字は
      1:東 2:西 3:南 4:北
      です。

      例えば、下記の視野データでは、プレイヤーから北に2つ離れた位置に猪がいることを表現していて、
      この場合、期待される結果としては4(北)を返してください。
      [
        0,0,1,0,0,
        0,0,0,0,0,
        0,0,9,0,0,
        0,0,0,0,0,
        0,0,0,0,0
      ]

      例えば、下記の視野データでは、プレイヤーから東に2つ離れた位置に熊がいることを表現していて、
      この場合、期待される結果としては熊から離れた方に逃げたいので、2(西)を返してください。
      [
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,9,0,2,
        0,0,0,0,0,
        0,0,0,0,0
      ]
    視野から得られる情報：{field_of_vision_info}
`;

  // テンプレート文章にあるチェック対象の単語を変数化
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", ""],
    ["user", template],
  ]);

  // チャットメッセージを文字列に変換するための出力解析インスタンスを作成
  const outputParser = new StringOutputParser();

  // OpenAIのAPIにこのプロンプトを送信するためのチェーンを作成
  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  // 関数を実行
  return await llmChain.invoke({
    field_of_vision_info: map_create_prompt,
  });
};

*/
var partsArray: { dispose: () => void; }[] | Mesh[] = [];
var partsArray2: { dispose: () => void; }[] | AbstractMesh[] = [];
var chipArray: {
  id: number; type: number; col: number; row: number;
}[] = [];
var persons: Person[] = [];
var items: Item[] = [];

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
      this.tickId = getRand(20, 30);
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
    var h = c!.type;
    this.mesh!.position.y = h / 2;
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
  setMeshPosition(col: number, row: number) {
    this.mesh!.position.x = col;
    this.mesh!.position.z = row;
    var c = getChip(col, row);
    var h = c!.type;
    this.mesh!.position.y = h / 2;
  }
}

function createItem(scene: Scene, type: number) {
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
        partsArray2.push(mesh);
      }
      const targetNum = getRand(1, MAP_SIZE * MAP_SIZE);
      const chip = chipArray[targetNum];
      var i: Item = new Item(targetNum, chip.col, chip.row, 1);
      i.setMesh(mesh);

      var c = getChip(chip.col, chip.row);
      var h = c!.type;

      mesh.position.x = chip.col;
      mesh.position.y = h / 2;
      mesh.position.z = chip.row;
      setMeshPosition(mesh, chip.col, chip.row);
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

function setMeshPosition(mesh: AbstractMesh, col: number, row: number) {
  var c = getChip(col, row);
  var h = c!.type;
  mesh.position.x = col;
  mesh.position.y = h / 2;
  mesh.position.z = row;
}

var FirstTargetNums: any[] = [];
function setFirstTargetNums() {
  for (var i = 0; i < chipArray.length; i++) {
    if (chipArray[i].type > 2) {
      FirstTargetNums.push(i);
    }
  }
}


function createNPC(scene: Scene, type: number) {
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
      setMeshPosition(mesh, chip.col, chip.row);
    }
  );
}

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
  items = [];

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

/*
function getObjectType(col: number, row: number) {
  for (var i = 0; i < persons.length; i++) {
    if (persons[i].col == col && persons[i].row == row && persons[i].type > 1) {
      return persons[i].type;
    }
  }
  for (var i = 0; i < items.length; i++) {
    if (items[i].col == col && items[i].row == row) {
      return items[i].type + 100;
    }
  }
  return 0;
}
*/
function generateMap(scene: Scene) {
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

  setFirstTargetNums();

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
  var button1 = GUI.Button.CreateSimpleButton("but", "Map");
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
  var button2 = GUI.Button.CreateSimpleButton("but", "Map");
  button2.width = "60px"
  button2.height = "20px";
  button2.color = "white";
  button2.top = 200;
  button2.cornerRadius = 10;
  button2.background = "black";
  button2.onPointerUpObservable.add(function () {
    //alert("you did it!");
    resetMap(scene);
  });
  advancedTexture.addControl(button1);
  advancedTexture.addControl(button2);

  /*
scoreBlock = new BABYLON.GUI.TextBlock();
    scoreBlock.text = point + "pt";
    scoreBlock.fontSize = 20;
    scoreBlock.top = -300;
    scoreBlock.left = -150;
    scoreBlock.color = "black";
    advancedTexture.addControl(scoreBlock);
  */

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
    //var aa = await llmchain_invoke("マップサイズ : " + MAP_SIZE + "x" + MAP_SIZE + "");
    var aa = await generateMapCoordinate("");
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
  //console.log("LENGTH : " + MAP_ARRAY.length);
  //console.log(MAP_ARRAY);
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
          var c = getChip(persons[j].targetCol, persons[j].targetRow);
          var h = c!.type;
          persons[j].mesh!.position.y = h / 3;
        }
      }
      //console.log(persons[j].col + "-" + persons[j].row + "/" + persons[j].targetCol + "-" + persons[j].targetRow + " " + persons[j].isTargetAvailable);
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
        /*
        if (type2 != 0) {
          d = 3;
        }
        if (type4 != 0) {
          d = 2;
        }
        if (type5 != 0) {
          d = 1;
        }
        if (type7 != 0) {
          d = 4;
        }
        */
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
          }
        }
      }
    }

    for (var i = 0; i < persons.length; i++) {
      for (var j = 0; j < items.length; j++) {
        if (persons[i].col == items[j].col && persons[i].row == items[j].row) {
          items[j].mesh?.dispose();
          items.splice(j, 1);
          //console.log("tree");
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
  }, 100);



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