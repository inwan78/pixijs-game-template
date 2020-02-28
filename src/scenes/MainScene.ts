import * as PIXI from 'pixi.js';
import GameManager from "../managers/GameManager";
import SoundManager from '../managers/SoundManager';
import InputManager from '../managers/InputManager';
import Config from '../Config';
import Scene from './Scene';
import Resource from '../Resource';
import Player from '../sprites/Player';
import Fade from "./transition/Fade";
import PauseScene from './PauseScene';
import {PixelateFilter} from '@pixi/filter-pixelate';
import * as PixiExt from '../PixiExtends'; 

export default class MainScene extends Scene {
  private pixelateFilter: PixelateFilter;
  private isTransitionInStart: boolean = true;
  /**
   * コンストラクタ
   * 描画を初期化する
   */
  constructor(){
    super();
    this.interactive = false;
    this.transitionIn = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);    
    this.initScene();
  }
  
  /***********************************************************************************************
   * ここからゲーム部分
   ***********************************************************************************************/
  /**
   * ゲームに使う変数の宣言
   */
  public player: Player;
  /**
   * シーンの初期処理
   */
  protected initScene(): void {
    //Sound・BGMバッファー読み込み
    //this.setBgm(Resource.Bgm.Main);
    //this.playBgm(Config.Volume.Bgm);
    
    //プレイヤー
    this.player = new Player();
    const player = this.player;
    this.addChild(player.sprite);
    this.registerUpdatingObject(player);
    
    //ポーズボタン
    const pauseBtn = new PixiExt.RectButton({width: 50, height: 50, text: '||', fontSize: 30});
    pauseBtn.position.set(30, 30);
    pauseBtn.interactive = true;
    this.addChild(pauseBtn);
    pauseBtn.on('pointerup', () => {
      this.pauseBgm();
      //SoundManager.playSound(Resource.Sound.Pause, Config.Volume.Sound);
      GameManager.pushScene(new PauseScene());
    });

    //モザイクフィルター
    this.pixelateFilter = new PixelateFilter();
    this.pixelateFilter.size = 1;
    this.filters = [this.pixelateFilter];
  }
   
  /*****************************************************************
   * メインループ
   *****************************************************************/
  private pixelSize = 60;
  public update(delta: number): void{
    super.update(delta);
    this.updateRegisteredObjects(delta);
    //モザイク処理の部分
    if(this.isTransitionInStart){
      if(--this.pixelSize < 1){
        this.pixelSize = 1;
        this.isTransitionInStart = false;
      }
      this.pixelateFilter.size = this.pixelSize;
    }

    const player = this.player;
    if(InputManager.checkButton('Start') == InputManager.keyStatus.DOWN){
      this.pauseBgm();
      //SoundManager.playSound(Resource.Sound.Pause, Config.Volume.Sound);
      GameManager.pushScene(new PauseScene());
    }
    if(InputManager.checkButton('A') > 0){
      player.sprite.scale.x = player.sprite.scale.y = 2;
    }else {
      player.sprite.scale.x = player.sprite.scale.y = 1;
    }
    switch(InputManager.checkDirection()){//8方向で返ってくる
      case InputManager.keyDirections.UP:
        player.y -= 2;
        break;
      case InputManager.keyDirections.UP_RIGHT:
        player.y -= 1.4;
        player.x += 1.4
        break;
      case InputManager.keyDirections.RIGHT:
        player.x += 2;
        break;
      case InputManager.keyDirections.DOWN_RIGHT:
        player.y += 1.4;
        player.x += 1.4
        break;
      case InputManager.keyDirections.DOWN:
        player.y += 2;
        break;
      case InputManager.keyDirections.DOWN_LEFT:
        player.y += 1.4;
        player.x -= 1.4
        break;      
      case InputManager.keyDirections.LEFT:
        player.x -= 2;
        break;
      case InputManager.keyDirections.UP_LEFT:
        player.y -= 1.4;
        player.x -= 1.4
        break;
    }    
    player.sprite.position.set(player.x, player.y);
  } 
}