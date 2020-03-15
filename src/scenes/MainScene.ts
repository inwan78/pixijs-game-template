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
import TileMap from '../modules/TileMap';
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
  protected prePosition: PIXI.Point;
  public flag = false;
  public jumpFlag = false;
  public player: Player;
  public enemy: PixiExt.Sprite;
  public isBgmPlaying = false;
  public map: PixiExt.TileMap;
  /**
   * シーンの初期処理
   */
  protected initScene(): void {
    //this.setBgm(Resource.Bgm.Main);
    //this.playBgm(Config.Volume.Bgm);
    this.isBgmPlaying = true;  
  
    const mapAnimationFrameList = [
      {
        frameNumber: 2,
        data: {
          pattern: [2, 3, 4, 3],
          interval: 30
        }
      },
    ];

    const resources = GameManager.instance.game.loader.resources as any;
    const mapData = resources[Resource.MapData.Stage1].data;
    this.map = new PixiExt.TileMap();
    this.map.image = resources[Resource.Image.Map].texture;
    const data = {//  tileMapの型宣言が面倒だったので
      tileWidth: mapData.tilewidth as number,
      tileHeight: mapData.tileheight as number,
      tileColumns: mapData.width as number
    }
    this.map.setSizes(data);
    this.map.createMapLayer(0, mapData.layers[0].data);
    this.map.setAnimation(0, mapAnimationFrameList);
    this.addChild(this.map);
    this.registerUpdatingObject(this.map);
    
    //プレイヤー
    this.player = new Player();
    this.addChild(this.player);
    this.registerUpdatingObject(this.player);
    
    //
    this.enemy = new PixiExt.Sprite(32, 32);
    this.enemy.image = resources[Resource.Image.Enemy].texture;
    this.addChild(this.enemy);
    
      
    //モザイクフィルター
    this.pixelateFilter = new PixelateFilter();
    this.pixelateFilter.size = 1;
    this.filters = [this.pixelateFilter];

  }
   
  /*****************************************************************
   * メインループ
   *****************************************************************/
  private pixelSize = 60;
  private vy = 1;
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
    if(InputManager.checkButton('A') == InputManager.keyStatus.DOWN){
      if(player.isJumping)return;
      player.animationType = Resource.AnimationTypes.JUMP;
      player.changeAnimation();
      player.isJumping = true;
      player.jumpCount = 0;
    }
    if(player.isJumping){
      if(++player.jumpCount > 60){
        player.animationType = Resource.AnimationTypes.WALK;
        player.changeAnimation();
        player.isJumping = false;
      }
    }
    switch(InputManager.checkDirection()){//8方向で返ってくる
      //面倒だったので4方向しか作ってない
      case InputManager.keyDirections.UP:
        player.y--;
        break;
      case InputManager.keyDirections.DOWN:
        player.y++;
        break;
      case InputManager.keyDirections.RIGHT:
        player.x++;
        break;
      case InputManager.keyDirections.LEFT:
        player.x--;
        break;
    }
    this.enemy.y += this.vy;
    if(this.enemy.y + this.enemy.height > Config.Screen.Height){
      this.vy = -1;
    }
    if(this.enemy.y < 0){
      this.vy = 1;
    }

    if(this.elapsedFrameCount % 15 == 0){
      if(++this.enemy.frameNumber >= 4){
        this.enemy.frameNumber = 0;
      }
    }
  } 
}