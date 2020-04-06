import * as PIXI from 'pixi.js';
import UpdateObject from '../interfaces/UpdateObject';
import Transition from '../interfaces/Transition';
import Immediate from './transition/immediate';
import GameManager from '../managers/GameManager';
import SoundManager from '../managers/SoundManager';
import * as PixiExt from '../PixiExtends';

export default abstract class Scene extends PixiExt.Container {
  protected transitionIn: Transition = new Immediate();
  protected transitionOut: Transition = new Immediate();
  protected objectsToUpdate: UpdateObject[] = [];
  
  //メインループで更新処理を行うべきオブジェクトの登録
  protected registerUpdatingObject(object: UpdateObject): void {
    this.objectsToUpdate.push(object);
  }
  /**
   * 更新処理を行うべきオブジェクトを更新する
   */
  protected updateRegisteredObjects(delta: number): void {
    const nextObjectsToUpdate = [];

    for (let i = 0; i < this.objectsToUpdate.length; i++) {
      const obj = this.objectsToUpdate[i];
      if (!obj || obj.isDestroyed()) {
        continue;
      }
      obj.update(delta);
      nextObjectsToUpdate.push(obj);
    }

    this.objectsToUpdate = nextObjectsToUpdate;
  }

  /**
   * シーン追加トランジション開始
   * 引数でトランジション終了時のコールバックを指定できる
   */
  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void{
    this.transitionIn.setCallback(() => onTransitionFinished(this));

    const container = this.transitionIn.getContainer();
    if(container){
      this.addChild(container);
    }
    this.transitionIn.begin();
  }

 /**
  * シーン削除トランジション開始
  * 引数でトランジション終了時のコールバックを指定できる
  */
  public beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void{
    this.transitionOut.setCallback(() => onTransitionFinished(this));
    
    const container = this.transitionOut.getContainer();
    if(container){
      this.addChild(container);
    }
    this.transitionOut.begin();
  }

  protected elapsedFrameCount: number = 0;

  /**
   * GameManagerによってrequestAnimationFrame毎に呼び出されるメソッド
   */
  public update(delta: number): void{
    this.elapsedFrameCount++;
    if(this.transitionIn.isActive()){
      this.transitionIn.update(delta);
    }else if(this.transitionOut.isActive()){
      this.transitionOut.update(delta);
    }
  }

  /**
   * BGMをセッティングする
   */
  protected setBgm(soundName: string): void {
    const resources = GameManager.instance.game.loader.resources as any;
    GameManager.instance.bgmName = soundName;
    SoundManager.createSound(soundName, resources[soundName].buffer);
  }
  /**
   * BGM をループ再生する
   */
  protected playBgm(volume): void {
    const bgm = SoundManager.getSound(GameManager.instance.bgmName);
    bgm.volume = volume;
    if (bgm) {
      bgm.play(true);
    }
  }

  /**
   * BGM 再生を止める
   */
  protected stopBgm(): void {
    const bgm = SoundManager.getSound(GameManager.instance.bgmName);
    if (bgm) {
      bgm.stop();
    }
  }
  /**
   * BGMポーズ
   */
  protected pauseBgm(): void{
    const bgm = SoundManager.getSound(GameManager.instance.bgmName);
    if (bgm) {
      bgm.pause();
    }
  }
  protected resumeBgm(): void{
    const bgm = SoundManager.getSound(GameManager.instance.bgmName);
    if (bgm) {
      bgm.resume();
    }
  }
}