import "./style.css";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
//import { MeshLoader } from "@babylonjs/core/Meshes/MeshLoader.js";
import { _OcclusionDataStorage, AbstractMesh, colorPixelShader, Nullable, SceneLoader, Space } from "@babylonjs/core";

import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience.js";

//import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";


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

function getRand(from, to) {
  return from + Math.floor(Math.random() * (to - from + 1));
};

const BASE_URL = "https://cx20.github.io/gltf-test";


const llmchain_invoke = async (sentences_before_check: string) => {
  // OpenAIのモデルのインスタンスを作成
  const chatModel = new ChatOpenAI({
    openAIApiKey: "",
  });

  // プロンプトのテンプレート文章を定義
  const template = `
  条件:
    マップサイズ: 30x30
    マップの要素: 0:緑地, 1:道路, 2:川, 3:木, 4:丘
    出力形式：要素番号を順番に配列で書き出し 例[1,0,1,0,2,2,3,1,4]
    ルール：道路はなるべく繋げてください。
    マップの上部は丘になるようにしてください
    その他の条件：{sentences_before_check}
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
    sentences_before_check: sentences_before_check,
  });
};

var PartsArray: { dispose: () => void; }[] | Mesh[] = [];
var chipArray: {
  var1: string; id: number; type: number; col: number; row: number; posX: number; posY: number; posZ: number;
  // func メソッドを登録
  func: () => void;
}[] = [];
function resetMap(scene: Scene) {
  for (var i = 0; i < PartsArray.length; i++) {
    PartsArray[i].dispose();
  }
  PartsArray = [];
  generateMap(scene);
};

/*
var persons: {
  setIsTargetAvailable(arg0: boolean): unknown;
  getIsTargetAvailable(): boolean;
  id: number; col: number; row: number; targetCol: number; targetRow: number; isTargetAvailable: boolean; mesh: AbstractMesh
}[] = [];
*/
const persons: Person[] = [];

class Person {
  id: number;
  col: number;
  row: number;
  targetCol: number;
  targetRow: number;
  isTargetAvailable: boolean;
  mesh: AbstractMesh | undefined;
  constructor(id: number, col: number, row: number) {
    this.id = id;
    this.col = col;
    this.row = row;
    this.targetCol = col;
    this.targetRow = row;
    this.isTargetAvailable = false;
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

function createNPC(scene: Nullable<Scene> | undefined) {
  SceneLoader.ImportMesh("", BASE_URL + "/sampleModels/Fox/glTF/", "Fox.gltf", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
    var mesh = newMeshes[0];
    mesh.scaling = new Vector3(0.05, 0.05, -0.05);
    mesh.rotation = Vector3.Zero();
    //最初の場所
    const targetNum = getRand(10, 500);
    const chip = chipArray[targetNum];
    console.log("first target is [num:" + targetNum + "/col:" + chip.col + "/row:" + chip.row + "]");
    var p: Person = new Person(targetNum, chip.col, chip.row);
    p.setMesh(mesh);
    mesh.position.x = chip.col;
    mesh.position.z = chip.row;
    persons.push(p);
  });
}

function generateMap(scene: Scene) {
  var mapWidth = 50;
  var chipNum = 1;
  //1: 平地 2:道路 3:川 4:木 5:石 6:家
  const Material1 = new StandardMaterial("material", scene);
  Material1.diffuseColor = new Color3(100 / 256, 200 / 256, 100 / 256);
  const Material2 = new StandardMaterial("material", scene);
  Material2.diffuseColor = new Color3(100 / 256, 100 / 256, 100 / 256);
  const Material3 = new StandardMaterial("material", scene);
  Material3.diffuseColor = new Color3(10 / 256, 10 / 256, 100 / 256);
  const Material4 = new StandardMaterial("material", scene);
  Material4.diffuseColor = new Color3(200 / 256, 20 / 256, 50 / 256);
  const Material5 = new StandardMaterial("material", scene);
  Material5.diffuseColor = new Color3(10 / 256, 200 / 256, 10 / 256);
  const Material6 = new StandardMaterial("material", scene);
  Material6.diffuseColor = new Color3(10 / 256, 20 / 256, 100 / 256);
  //boxMaterial.diffuseColor = Color3.Random();
  for (var row = 1; row <= mapWidth; row++) {
    for (var col = 1; col <= mapWidth; col++) {
      //1: 平地 2:道路 3:川 4:木 5:石 6:家
      var chipType = getRand(1, 4);
      var colPos = col * 1;
      var rowPos = row * 1;
      const boxSize2 = { width: 1, height: 1, depth: 1 };
      var box = MeshBuilder.CreateBox("box", boxSize2);
      PartsArray.push(box);
      box.position.x = colPos;
      box.position.z = rowPos;
      var chipObj = {
        var1: "",
        id: 0,
        type: 0,
        col: 0,
        row: 0,
        posX: 0,
        posY: 0,
        posZ: 0,
        // func メソッドを登録
        func: function () {
          alert("world");
        }
      };
      //var chipObj = chipObj;
      const demo = chipObj;
      demo.id = chipNum;
      demo.type = chipType;
      demo.col = col;
      demo.row = row;
      chipArray.push(demo);
      // = chipType;
      if (chipType == 1) {
        box.material = Material1;
        box.position.y = 0;
      } else if (chipType == 2) {
        box.material = Material2;
        box.position.y = 0.2;
      } else if (chipType == 3) {
        box.material = Material3;
        box.position.y = -0.4;
      } else if (chipType == 4) {
        box.material = Material4;
        box.position.y = 0.5;
      } else if (chipType == 5) {
        box.material = Material5;
        box.position.y = 0;
      } else if (chipType == 6) {
        box.position.y = 0;
        box.material = Material6;
      } else {
        box.position.y = 0;
        box.material = Material1;
      }
      chipNum++;
    }
  }

  createNPC(scene);
  createNPC(scene);
  //createNPC(scene)
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
  const camera = new ArcRotateCamera("Camera", -(Math.PI / 4) * 3, Math.PI / 4, 50, new Vector3(0, 0, 0), scene);
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

  var stepId = 0;
  setInterval(function () {
    for (var j = 0; j < persons.length; j++) {
      if (persons[j].mesh != undefined) {
        if (persons[j].mesh.position.x < persons[j].targetCol) {
          persons[j].mesh.position.x += 1;
          //persons[j].mesh.rotate(new Vector3(persons[j].mesh.position.x, persons[j].mesh.position.y, persons[j].mesh.position.z), Math.PI / 180 * 90, Space.LOCAL);
        }
        if (persons[j].mesh.position.x > persons[j].targetCol) {
          persons[j].mesh.position.x -= 1;
        }
        if (persons[j].mesh.position.z < persons[j].targetRow) {
          persons[j].mesh.position.z += 1;
        }
        if (persons[j].mesh.position.z > persons[j].targetRow) {
          persons[j].mesh.position.z -= 1;
        }

        if (persons[j].mesh.position.x == persons[j].targetCol
          && persons[j].mesh.position.z == persons[j].targetRow
          && persons[j].getIsTargetAvailable() == true) {
          persons[j].setIsTargetAvailable(false);
          persons[j].col = persons[j].targetCol;
          persons[j].row = persons[j].targetRow;
        }
      }
      if (persons[j].getIsTargetAvailable() == false && chipArray.length > 0) {
        var d = getRand(1, 4);
        console.log("direction>" + d);
        var isSetTraget = false;
        if (d == 1) {
          if (persons[j].targetCol + 1 < 30) {
            persons[j].targetCol = persons[j].targetCol + 1;
            isSetTraget = true;
          }
        }
        if (d == 2) {
          if (persons[j].targetCol + 1 > 1) {
            persons[j].targetCol = persons[j].targetCol - 1;
            isSetTraget = true;
          }
        }
        if (d == 3) {
          if (persons[j].targetRow + 1 < 30) {
            persons[j].targetRow = persons[j].targetRow + 1;
            isSetTraget = true;
          }
        }
        if (d == 4) {
          if (persons[j].targetRow - 1 > 1) {
            persons[j].targetRow = persons[j].targetRow - 1;
            isSetTraget = true;
          }
        }
        if (isSetTraget == true) {
          persons[j].setIsTargetAvailable(true);
        }
      }
      console.log("step:" + stepId + "/" + persons[j].getIsTargetAvailable() + "/x:" + persons[j].mesh.position.x + "/col:" + persons[j].col + "/tcol:" + persons[j].targetCol + "/y:" + persons[j].mesh.position.y + "/row:" + persons[j].row + "/trow:" + persons[j].targetRow);
    }
    stepId++;
  }, 400);

  // Run render loop
  babylonEngine.runRenderLoop(() => {
    scene.render();
  });
}

main();