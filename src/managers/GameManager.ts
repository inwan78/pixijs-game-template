import * as PIXI from 'pixi.js';
import Scene from "../scenes/Scene";
import Config from "../Config";
import SoundManager from './SoundManager';
import { detect } from 'detect-browser';
import InputManager from './InputManager'
export default class GameManager {
  //シングルトンインスタンス
  public static instance: GameManager;
  //PIXI.Applicationインスタンス
  public game!: PIXI.Application;
  //現在のシーン
  private currentScene?: Scene;
  //待機シーン
  private waitingScene?: Scene;
  //シーンをプッシュしたかのフラグ
  private isPushedScene: boolean = false;
  //キャラクターなどのアニメーションスプライト保持用
  public spriteAnimationData: any;

  /**
   * ゲーム状況管理系の変数
   */
  public score: number = 0;
  public hiscore: number = 0;
  public stage: number = 0;
  public isGameover: boolean = false;
  public bgmName: string;//演奏中のBGMの名前の保存用
  public localStorage: any;//ローカルストレージ
  public rankingData: {rank?: number, all?: number} | [{name?: string, score?: number, date?: string}];

  /**
   * コンストラクタ
   * PIXI.Applicationインスタンスはユーザー任意のものを使用する
   */
  constructor(app: PIXI.Application){
    if(GameManager.instance){
      throw new Error('GameManager can be instantiate only once');
    }
    this.game = app;
  }

  /**
   * ゲームを起動する
   * 画面サイズやPIXI.ApplicationOptionsを渡すことができる
   */
  public static start(): void {
    //PIXI Application生成
    const game = new PIXI.Application({
      width: Config.Screen.Width,
      height: Config.Screen.Height,
      backgroundColor: Config.Screen.BakcgroundColor
    });
    //PIXI.ApplicationインスタンスのloaderプロパティにbaseUrlを設定
    game.loader.baseUrl = Config.ResourceBaseUrl;
    //GameManagerインスタンス生成
    GameManager.instance = new GameManager(game);
    //canvasをDOMに追加
    document.body.appendChild(game.view);

    // リサイズイベントの登録
    window.addEventListener('resize', GameManager.resizeCanvas);
    // サイズ初期化
    GameManager.resizeCanvas();

    // 必要であればフルスクリーンの有効化
    GameManager.enableFullScreenIfNeeded();

    game.ticker.add((delta: number) => {
      if(this.instance.currentScene){
        this.instance.currentScene.update(delta);
      }
    });
    SoundManager.init();
    InputManager.init();
  }

  /**
   * フルスクリーンに切り替える
   */
  public static requestFullScreen(): void {
    const body = window.document.body as any;
    const requestFullScreen =
      body.requestFullScreen || body.webkitRequestFullScreen;
    requestFullScreen.call(body);
  }
  /**
   * シーンをロードする
   */
  public static loadScene(newScene: Scene): void {
    const instance = GameManager.instance;

    //現在のシーンを廃棄
    if(instance.currentScene){
      instance.currentScene.destroy();
    }
    //waitingSceneもあれば廃棄(pushシーンからでも削除できるように)
    if(instance.waitingScene){
      instance.waitingScene.destroy();
      instance.isPushedScene = false;
    }
    instance.currentScene = newScene;

    //シーン起動
    if(instance.game){
      instance.game.stage.addChild(newScene);
    }
    newScene.beginTransitionIn((_: Scene) => {});
  }
  /**
   * カレントシーンの上に別シーンをプッシュする
   */
  public static pushScene(newScene: Scene): void {
    const instance = GameManager.instance;

    instance.isPushedScene = true;
    instance.waitingScene = instance.currentScene;//現在のシーンを待機シーンに保存
    instance.currentScene = newScene;
    //シーン起動
    if(instance.game){
      instance.game.stage.addChild(newScene);
    }
  }
  /**
   * プッシュしていたシーンを削除し待機シーンをカレントに戻す
   */
  public static popScene(): void {
    const instance = GameManager.instance;

    if(!instance.isPushedScene) return;//pushされていなければ抜ける
    if(!instance.waitingScene) return;

    instance.isPushedScene = false;
    instance.currentScene.destroy();    
    instance.currentScene = instance.waitingScene;
  }
  /**
   * HTML canvas のりサイズ処理を行う
   */
  public static resizeCanvas(): void {
    const game = GameManager.instance.game;
    const renderer = game.renderer;

    let canvasWidth;
    let canvasHeight;

    const rendererHeightRatio = renderer.height / renderer.width;
    const windowHeightRatio = window.innerHeight / window.innerWidth;

    // 画面比率に合わせて縦に合わせるか横に合わせるか決める
    if (windowHeightRatio > rendererHeightRatio) {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerWidth * (renderer.height / renderer.width);
    } else {
      canvasWidth = window.innerHeight * (renderer.width / renderer.height);
      canvasHeight = window.innerHeight;
    }

    game.view.style.width  = `${canvasWidth}px`;
    game.view.style.height = `${canvasHeight}px`;
    Config.Display.Width = canvasWidth;
    Config.Display.Height = canvasHeight
  }
  /**
   * 動作環境に応じて適切ならフルスクリーン設定をする
   */
  private static enableFullScreenIfNeeded(): void {
    const browser = detect();
    // iOS は対応していないが一応記述しておく
    if (browser && (browser.os === 'iOS' || browser.os === 'Android OS')) {
      const type = typeof document.ontouchend;
      const eventName = (type === 'undefined') ? 'mousedown' : 'touchend';
      document.body.addEventListener(eventName, GameManager.requestFullScreen);
    }
  }
}