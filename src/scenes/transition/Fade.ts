import * as PIXI from 'pixi.js';
import GameManager from "../../managers/GameManager";
import Transition from "../../interfaces/Transition";

export default class Fade implements Transition {
  //フェード開始時の黒画面アルファ
  private alphaFrom!: number;
  //フェード終了時の黒画面アルファ
  private alphaTo!: number;
  //1フレーム毎の黒画面アルファ加算値
  private alphaProgress: number;
  //黒画面のコンテナ
  private container = new PIXI.Container();
  //黒画面の描画
  private overlay = new PIXI.Graphics();
  //トランジション開始フラグ
  private transitionBegan: boolean = false;
  //トランジション終了フラグ
  private transitionFinished: boolean = false;
  //トランジション終了時コールバック
  private onTransitionFinished: () => void = () => {};

  constructor(alphaFrom: number, alphaTo: number, alphaProgress: number){
    this.alphaFrom = alphaFrom;
    this.alphaTo = alphaTo;
    this.alphaProgress = alphaProgress;

    const width = GameManager.instance.game.view.width;
    const height = GameManager.instance.game.view.height;

    this.overlay.beginFill(0x000000);
    this.overlay.moveTo(0, 0);
    this.overlay.lineTo(width, 0);
    this.overlay.lineTo(width, height);
    this.overlay.lineTo(0, height);
    this.overlay.endFill();

    this.overlay.alpha = this.alphaFrom;
    this.container.addChild(this.overlay);
  }
  public getContainer(): PIXI.Container | null {
    return this.container;
  }

  public begin(): void {
    this.transitionBegan = true;
  }
  public isBegan(): boolean {
    return this.transitionBegan;
  }
  public isFinished(): boolean {
    return this.transitionFinished;
  }
  public isActive(): boolean {
    return this.isBegan() && !this.isFinished();
  }

  public update(_dt: number): void {
    if(!this.isBegan()) return;
    if(this.isFinished()) return;

    if((this.alphaTo <= this.alphaFrom && this.overlay.alpha <= this.alphaTo) || (this.alphaTo >= this.alphaFrom && this.overlay.alpha >= this.alphaTo)){
      this.onTransitionFinished();
      this.transitionFinished = true;
    }else{
      this.overlay.alpha += this.alphaProgress;
    }
  }
  
  public setCallback(callback: () => void): void {
    this.onTransitionFinished = callback;
  }
}