import * as PIXI from 'pixi.js';
import SpriteAnimationMaster, { SpriteAnimationTypeIndex } from '../interfaces/SpriteAnimationMaster';
import Resource from '../Resource';
import UpdateObject from '../interfaces/UpdateObject';

export default class AnimationSprite implements UpdateObject{
  
  public sprite!: PIXI.Sprite;

  //現在のアニメーション種別
  public characterType: string;
  public animationType!: string;
  protected destroyed: boolean = false;
  protected animationMaster!: SpriteAnimationMaster;
  protected animationFrameId: number = 1;
  //現在のアニメーションフレーム
  protected animationFrameIndex: number = 1;
  //経過フレーム数
  protected elapsedFrameCount: number = 0;

  /**
   * 再生をリクエストされたアニメーション種別
   */
  protected requestedAnimation: string | null = null;
  protected requestedAnimationType: string | null = null;

  //表示座標
  public x: number;
  public y: number;

  constructor(){
    this.sprite = new PIXI.Sprite();
  }

    /**
   * アニメーション再生をリセットする
   */
  public resetAnimation(): void {
    this.requestedAnimationType = null;
    this.elapsedFrameCount = 0;
    this.animationFrameId = 1;
  }

   /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    if (this.requestedAnimation) {
      if (this.transformAnimationIfPossible(this.characterType)) {
        this.requestedAnimation = null;
      }
    }
    this.updateAnimation();
  }

   /**
   * 人師種別のアニメーションの再生をリクエストする
   * リクエストされたアニメーションは再生可能になり次第再生される
   */
  public requestAnimation(type: string): void {
    this.requestedAnimation = type;
  }
  
  public isDestroyed(): boolean {
    return this.destroyed;
  }
  public destroy(): void {
    this.sprite.destroy();
    this.destroyed = true;
  }
 
  public updateAnimation(): void {
    const index = this.animationType as SpriteAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if(!animation){
      return;
    }
    //フレーム数がスプライトシート更新頻度に達しているかチェック
    if((this.elapsedFrameCount % animation.updateDuration) === 0) {
      //最終フレームならアニメーションをリセット
      if(this.isAnimationLastFrameTime()){
        this.resetAnimation();
      }
      const cacheKey = animation.frames[this.animationFrameId - 1];
      this.sprite.texture = PIXI.utils.TextureCache[cacheKey];
      this.animationFrameId++;
    }
    this.elapsedFrameCount++;
  }
 
  /**
   * 現在のアニメーションが終了するフレーム時間かどうかを返す
   */
  public isAnimationLastFrameTime(): boolean {
    const index = this.animationType as SpriteAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if(!animation){
      return false;
    }
    const duration = animation.updateDuration;
    const lastId = animation.frames.length;
    const maxFrameTime = duration * lastId;
    return this.elapsedFrameCount === maxFrameTime;
  }

  /**
   * アニメーション遷移が可能であれば遷移する
   */
  private transformAnimationIfPossible(type): boolean {
    const animationTypes = Resource.AnimationTypes[type];

    switch (this.requestedAnimation) {
      case animationTypes.WAIT:
      case animationTypes.WALK: {
        if (this.animationType !== animationTypes.WALK) {
          if (this.isAnimationLastFrameTime()) {
            this.animationType = this.requestedAnimation;
            this.resetAnimation();
            return true;
          }
        }
        break;
      }
      case animationTypes.DAMAGE:
      case animationTypes.ATTACK: {
        this.animationType = this.requestedAnimation;
        this.resetAnimation();
        return true;
      }
      default: break;
    }
    return false;
  }
}