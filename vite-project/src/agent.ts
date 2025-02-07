import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
const openAIKey = "";

export const generateMapCoordinate = async (map_create_prompt: string) => {

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


export const getNPCAction = async (field_of_vision_info: string) => {
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
    field_of_vision_info: field_of_vision_info,
  });
};

