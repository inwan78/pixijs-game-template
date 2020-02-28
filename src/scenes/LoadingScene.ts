import * as PIXI from 'pixi.js';
import Config from '../Config';
import GameManager from '../managers/GameManager';
import SoundManager from '../managers/SoundManager';
import Resource from '../Resource';
import Scene from './Scene';
import TitleScene from './TitleScene';

export default class LoadingScene extends Scene {
  private text: PIXI.Text;
  private percentage: PIXI.Text;

  constructor(){
    super();

    this.text = new PIXI.Text("NOW LOADING", new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 32,
      fill: 0xffffff,
      padding: 12
    }));
    this.text.anchor.set(0, 1);
    this.text.position.set(Config.Screen.Width * 0.1, Config.Screen.Height * 0.48);
    this.addChild(this.text);

    this.percentage = new PIXI.Text("0%", new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 32,
      fill: 0xffffff,
      padding: 12
    }));
    this.percentage.anchor.set(1, 1);
    this.percentage.position.set(Config.Screen.Width * 0.9, Config.Screen.Height * 0.48);
    this.addChild(this.percentage);

    //リソースロード
    this.beginLoadResource();
  }
  /**
   * リソースダウンロードのフローを実行する
   * loadSceneされたときにGameManagerから呼ばれるメソッド
   */
  public beginLoadResource(): Promise<void> {
    return new Promise((resolve) => {
      this.loadInitialResource(() => resolve());
    }).then(() => {
      return new Promise((resolve) => {
        const additionalAssets = this.onInitialResourceLoaded();
        this.loadAdditionalResource(additionalAssets, () => resolve());
      });
    }).then(() => {
      this.onResourceLoaded();
    });
  }
  protected createInitialResourceList(): (LoaderAddParam | string)[] {
    let assets = [];
    //データのファイル名登録（スプライト関係はここではしない）
    let data = [];
    //画像
    if(Object.keys(Resource.Image).length > 0){
     for(let key in Resource.Image) {
        data.push(Resource.Image[key]);
      }
    }
    
    //se
    if(Object.keys(Resource.Sound).length > 0){
      for(let key in Resource.Sound) {
        data.push(Resource.Sound[key]);
      }
    }
    //bgm
    if(Object.keys(Resource.Bgm).length > 0){
      for(let key in Resource.Bgm) {
        data.push(Resource.Bgm[key]);
      }
    }
    //assetsに登録
    for(let i = 0; i < data.length; i++) {
      assets.push(data[i]);
    }
    return assets;
  }
  /**
   * 最初に指定されたリソースをダウンロードする
   */
  protected loadInitialResource(onLoaded: () => void): void {
    const assets = this.createInitialResourceList();
    const filteredAssets = this.filterLoadedAssets(assets);
    let flag = false;
    if(filteredAssets.length > 0) {
      GameManager.instance.game.loader
        .add(filteredAssets)
        .on("progress", (loader) => {
          if(flag)return;//理由はわからないけど2回読み込みがあるので2回目は無視する
          this.percentage.text = Math.floor(loader.progress) + "%";
          if(loader.progress == 100){
            flag = true;
          } 
        })
        .load(() => onLoaded());
    }else{
      onLoaded();
    }
  }
  /**
   * 渡されたアセットのリストから、ロード済みのものをフィルタリングする
   */
  private filterLoadedAssets(assets: (LoaderAddParam | string)[]): LoaderAddParam[] {
    const assetMap = new Map<string, LoaderAddParam>();

    for(let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if(typeof asset ==='string') {
        if(!GameManager.instance.game.loader.resources[asset] && !assetMap.has(asset)){
          assetMap.set(asset, {name: asset, url: asset});
        }
      }else {
        if(GameManager.instance.game.loader.resources[asset.name] && !assetMap.has(asset.name)){
          assetMap.set(asset.name, asset);
        }
      }
    }
    return Array.from(assetMap. values());
  }
  /**
   * loadInitialResource 完了時のコールバックメソッド
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = [];
    
    let data = [];
    
    if(Object.keys(Resource.SpriteSheetName).length > 0){
      for(let key in Resource.SpriteSheetName) {
        data.push(Resource.SpriteSheetName[key]);
      }
    }
    //画像情報を追加
    for(let i = 0; i < data.length; i++){
      additionalAssets.push(Resource.Sprite(data[i]));//
    }
    //アニメパターンjson追加
    data = [];
    if(Object.keys(Resource.AnimationSpriteName).length > 0){
      for(let key in Resource.AnimationSpriteName) {
        data.push(Resource.SpriteSheetName[key]);
      }
      additionalAssets.push(Resource.SpriteAnimation(data));
    } 
    return additionalAssets;
  }
  
  /**
   * onInitialResourceLoaded で発生した追加のリソースをロードする
   */
  protected loadAdditionalResource(assets: (string | LoaderAddParam)[], onLoaded: () => void) {
    GameManager.instance.game.loader.add(this.filterLoadedAssets(assets)).load(() => onLoaded());
  }  

  /**
   * beginLoadResource完了時のコールバックメソッド
   * ロード関係最後のメソッド
   */
  protected onResourceLoaded(): void {
    const resources = GameManager.instance.game.loader.resources as any;
    let animationSpriteNames = [];
    let spriteNames = [];
    if(Object.keys(Resource.AnimationSpriteName).length > 0){
      for(let key in Resource.AnimationSpriteName) {
        animationSpriteNames.push(Resource.AnimationSpriteName[key]);
        spriteNames.push(key);
      }
      //スプライトアニメーションを保存
      let spriteDatas = {};//データ保存用
      const key = Resource.SpriteAnimation(animationSpriteNames);
      const animationMasters = resources[key].data;
      for (let i = 0; i < animationMasters.length; i++) {
        const master = animationMasters[i];
        spriteDatas[spriteNames[i]] = master; //キャラクター名をキーにしてオブジェクトを保存
      }
      GameManager.instance.spriteAnimationData = spriteDatas;//ゲームマネージャーに保存
    }
    //サウンドの準備
    if(Object.keys(Resource.Sound).length > 0){
      for(let key in Resource.Sound) {
        SoundManager.prepareSound(Resource.Sound[key]);
      }
    }
    GameManager.loadScene(new TitleScene());
  }  

  /**
   * 読み込み状況を表示
   */
  private count: number = 0;
  public update(delta: number): void{
    super.update(delta);
    if(this.elapsedFrameCount % 7 == 0) {
      switch(this.count) {
        case 0: 
          this.text.text = "NOW LOADING";
          break;
        case 1: 
          this.text.text = "NOW LOADING.";
          break;
        case 2: 
          this.text.text = "NOW LOADING..";
          break;
        case 3: 
          this.text.text = "NOW LOADING...";
          break;
      }
      if(++this.count > 3) {
        this.count = 0;
      }
    }
  }
}