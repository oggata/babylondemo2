import "./style.css";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
//import { MeshLoader } from "@babylonjs/core/Meshes/MeshLoader.js";
import { colorPixelShader, Nullable, SceneLoader } from "@babylonjs/core";

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


//import "dotenv/config"

// XR ボタンを右下に表示させるために必須
import "@babylonjs/core/Helpers/sceneHelpers";


function getRand(from, to) {
  return from + Math.floor(Math.random() * (to - from + 1));
};

const BASE_URL = "https://cx20.github.io/gltf-test";

//var chipArray = [];
var persons: Person[] | { age: string; }[] = [];

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

//llmchain_invoke("道路は必ず繋げてください").then(console.log);
var PartsArray: { dispose: () => void; }[] | Mesh[] = [];
var chipArray: {
  var1: string; id: number; type: number; col: number; row: number; posX: number; posY: number; posZ: number;
  // func メソッドを登録
  func: () => void;
}[] = [];
function resetMap(scene: Scene) {
  //alert("reset map");
  for (var i = 0; i < PartsArray.length; i++) {
    PartsArray[i].dispose();
  }
  //配列をリセット
  PartsArray = [];

  generateMap(scene);
};

//var chipArray = [];
var targetObj = {

  var1: "",
  id: 0,
  type: 0,
  col: 0,
  row: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  isAvailable: false,
  // func メソッドを登録
  func: function () {
    alert("world");
  }

}
var npcs = [];

class Person {
  name: string;
  id: number;
  col: number;
  row: number;
  targetCol: number;
  targetRow: number;
  isTargetAvailable : boolean;
  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
    this.col = 0;
    this.row = 0;
    this.targetCol = 0;
    this.targetRow = 0;
    this.isTargetAvailable = false;
  }
}

const nps = {
  id: 0,
  col: 0,
  row: 0,
  targetMesh: Mesh,
  targetAvailable: false,
  targetObj: targetObj,
  ddd: Person
}

//var chipArray = [];
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
    console.log(id);
  }
};


function createNPC(scene: Nullable<Scene> | undefined) {
  SceneLoader.ImportMesh("", BASE_URL + "/sampleModels/Fox/glTF/", "Fox.gltf", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
    //let step = 0.05 * scene.getAnimationRatio();  
    const mesh = newMeshes[0];
    mesh.scaling = new Vector3(0.05, 0.05, -0.05);
    //mesh.position = new Vector3(0, 0, 0);
    mesh.rotation = Vector3.Zero();
    //最初の場所
    var targetNum = getRand(10, 500);
    var id = getRand(1, 100);
    console.log(">>>>>" + targetNum);





    var ddd = new Person('Takashi', targetNum);
    persons.push(ddd);
    //targetNum = 25;
    //console.log("targetnum;" + targetNum);
    var chip = chipArray[targetNum];
    console.log("first target is [col:" + chip.col + "/row:" + chip.row + "]");
    mesh.position = new Vector3(chip.col, 0, chip.row);
    var thisnps = nps;
    nps.id = id;
    nps.targetMesh = mesh;
    nps.targetObj = targetObj;
    nps.col = chip.col;
    nps.row = chip.row;
    nps.ddd = ddd;
    npcs.push(thisnps);
    console.log(npcs.length);
    scene.onBeforeRenderObservable.add(() => {
      //mesh.position.x += step;
    });
  });
}

function getdoubleDigestNumer(number) {
  return ("0" + number).slice(-2);
}

function generateMap(scene) {
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
      //console.log(col);
      //chipObj.posX = colPos;
      //chipObj.posZ = rowPos;
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

  //createNPC(scene);
  //createNPC(scene);
  //createNPC(scene)
}

const main = async () => {
  console.log("ccccc");

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
  button1.onPointerUpObservable.add(function() {
      //alert("you did it!");
      resetMap(scene);
  });
  advancedTexture.addControl(button1);   
  
  //地面
  var ground = Mesh.CreateGround("ground1", 2000, 2000, 2, scene);
  //ground.diffuseColor = new BABYLON.Color3(0, 0, 1);
  var material = new StandardMaterial("bookcase", scene);
  material.diffuseColor = new Color3(.2, .4, .5);
  ground.material = material
  ground.receiveShadows = true;
  ground.checkCollisions = true;

  var stepId = 0;
  setInterval(function () {

    //resetMap(scene);

    stepId++;
    for (var i = 0; i < npcs.length; i++) {
      if (npcs[i].targetAvailable == false && chipArray.length > 0) {
        var d = getRand(1, 4);
        //console.log("targetcol&row:" + chipArray[targetNum].col + "-" + chipArray[targetNum].row);
        if (d == 1) {
          npcs[i].targetObj.col = npcs[i].col + 1;
          npcs[i].targetObj.row = npcs[i].row;
        }
        if (d == 2) {
          npcs[i].targetObj.col = npcs[i].col - 1;
          npcs[i].targetObj.row = npcs[i].row;
        }
        if (d == 3) {
          npcs[i].targetObj.col = npcs[i].col;
          npcs[i].targetObj.row = npcs[i].row + 1;
        }
        if (d == 4) {
          npcs[i].targetObj.col = npcs[i].col;
          npcs[i].targetObj.row = npcs[i].row - 1;
        }
        if (1 <= npcs[i].targetObj.col && npcs[i].targetObj.col <= 30 && 1 <= npcs[i].targetObj.row && npcs[i].targetObj.row <= 30) {
          npcs[i].targetAvailable = true;
          //console.log("next target is [col:" + npcs[i].targetObj.col + "/row:" + npcs[i].targetObj.row + "]");
        }
        //console.log(npcs[i].targetObj.col + "-" + npcs[i].targetObj.row);
      }
      //console.log(npcs.length);
      for (var j = 0; j < persons.length; j++) {
        console.log("person>" + persons[j].age + "-" + j);
      }

      for (var i = 0; i < npcs.length; i++) {
        //console.log("id>" + npcs[i].ddd.age + "-" + i);
        if (npcs[i].targetMesh.position.x < npcs[i].targetObj.col) {
          //console.log(stepId + " " + npcs[i].id);
          //console.log(npcs[i].targetMesh.position.x + "-" + npcs[i].targetObj.col);
          //console.log("dd");
          npcs[i].targetMesh.position.x += 1;
          //npcs[i].targetMesh.position.x = toFixed(1).npcs[i].targetMesh.position.x;
        }
        if (npcs[i].targetMesh.position.x > npcs[i].targetObj.col) {
          //console.log(stepId + " " + "b");
          //console.log(npcs[i].targetMesh.position.x + "-" + npcs[i].targetObj.col);
          npcs[i].targetMesh.position.x -= 1;
          //npcs[i].targetMesh.position.x = toFixed(1).npcs[i].targetMesh.position.x;
        }
        if (npcs[i].targetMesh.position.z < npcs[i].targetObj.row) {
          //console.log(stepId + " " + "c");
          //console.log(npcs[i].targetMesh.position.z + "-" + npcs[i].targetObj.row);
          npcs[i].targetMesh.position.z += 1;
        }
        if (npcs[i].targetMesh.position.z > npcs[i].targetObj.row) {
          //console.log(stepId + " " + "d");
          //console.log(npcs[i].targetMesh.position.z + "-" + npcs[i].targetObj.row);
          npcs[i].targetMesh.position.z -= 1;
        }
        //console.log(npcs[i].targetMesh.position.x + "-" + npcs[i].targetObj.col + "|" + npcs[i].targetMesh.position.z + "-" + npcs[i].targetObj.row);
        //console.log(npcs[i].targetMesh.position.z + "-" + npcs[i].targetObj.row);
        if (npcs[i].targetMesh.position.x == npcs[i].targetObj.col
          && npcs[i].targetMesh.position.z == npcs[i].targetObj.row
          && npcs[i].targetAvailable == true) {
          //targetをリセットする
          npcs[i].targetAvailable = false;
          npcs[i].col = npcs[i].targetObj.col;
          npcs[i].row = npcs[i].targetObj.row;
          //console.log("target reset");
        } else {
          //console.log(stepId + " " + npcs[i].targetAvailable + "|" + npcs[i].targetMesh.position.x + "-" + npcs[i].targetObj.col + "|" + npcs[i].targetMesh.position.z + "-" + npcs[i].targetObj.row);
          /*
            if(npcs[i].targetMesh.position.x < npcs[i].targetObj.col){
              //console.log("dd");
              npcs[i].targetMesh.position.x += 0.1;
            }
            if(npcs[i].targetMesh.position.x > npcs[i].targetObj.col){
              npcs[i].targetMesh.position.x -= 0.1;
            }
            if(npcs[i].targetMesh.position.z < npcs[i].targetObj.row){
              npcs[i].targetMesh.position.z += 0.1;
            }
            if(npcs[i].targetMesh.position.z > npcs[i].targetObj.row){
              npcs[i].targetMesh.position.z -= 0.1;
            }
            */
        }

      }


    }
  }, 1000);


  // Run render loop
  babylonEngine.runRenderLoop(() => {
    scene.render();
  });
}

main();