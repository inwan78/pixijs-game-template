import * as PIXI from 'pixi.js';
import GameManager from '../managers/GameManager';
import SoundManager from '../managers/SoundManager';
import Resource from '../Resource';
import Scene from './Scene';
import TitleScene from './TitleScene';

export default class LoadingScene extends Scene {
  private text: PIXI.Text;
  private borders: PIXI.Graphics;
  private bar: PIXI.Graphics;
  private percentage: PIXI.Text;
 
  private bordersWidth: number;
  private bordersHeight: number;
  private bodersLineHeight: number;
  private barX: number;
  private barY: number;
  

  constructor(){
    super();

    const renderer = GameManager.instance.game.renderer;
    this.text = new PIXI.Text("NOW LOADING", new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 32,
      fill: 0xffffff,
      padding: 12
    }));
    this.text.anchor.set(0, 1);
    this.text.position.set(renderer.width*0.1, renderer.height*0.48);
    this.addChild(this.text);

    this.percentage = new PIXI.Text("0%", new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 32,
      fill: 0xffffff,
      padding: 12
    }));
    this.percentage.anchor.set(1, 1);
    this.percentage.position.set(renderer.width*0.9, renderer.height*0.48);
    this.addChild(this.percentage);

    
    this.bordersWidth = renderer.width * 0.8;
    this.bordersHeight = renderer.height * 0.02;
    this.bodersLineHeight = this.bordersHeight * 0.2;
    this.barX = renderer.width * 0.1;
    this.barY = renderer.height * 0.5;
    
    //枠を描く
    this.borders = new PIXI.Graphics();
    // lineStyle(width, color , alpha透明度)
    this.borders.lineStyle(this.bodersLineHeight, 0xFFFFFF, 1);
    this.borders.beginFill(0x000000);
    // drawRect(x, y, width, height)
    this.borders.drawRect(this.barX, this.barY, this.bordersWidth, this.bordersHeight);
    this.borders.endFill();
    this.addChild(this.borders);

    //枠内を塗りつぶすバー
    this.bar = new PIXI.Graphics();
    // lineStyle(width, color , alpha透明度)
    this.bar.lineStyle(this.bodersLineHeight, 0xFFFFFF, 1);
    this.bar.beginFill(0xFFFFFF);
    // drawRect(x, y, width, height)
    this.bar.drawRect(this.barX+this.bodersLineHeight, this.barY+this.bodersLineHeight, this.bodersLineHeight, this.bordersHeight-this.bodersLineHeight*2);
    this.bar.endFill();
    this.addChild(this.bar);


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
   * （読み込むjsonファイルを登録してるっぽい）
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = [];
    
    let data = [];
    
    if(Object.keys(Resource.SpriteSheetName).length > 0){
      for(let key in Resource.SpriteSheetName) {
        data.push(Resource.SpriteSheetName[key]);
      }
    }
    //スプライトのjson追加
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
    //マップデータjson追加
    if(Object.keys(Resource.MapData).length > 0){
      for(let key in Resource.MapData) {
        additionalAssets.push(Resource.MapData[key]);
      }
    }
    return additionalAssets;
  }
  
  /**
   * onInitialResourceLoaded で発生した追加のリソースをロードする
   * (jsonファイルを読み込んでるっぽい)
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
    
    this.bar.lineStyle(this.bodersLineHeight, 0xFFFFFF, 1);
    this.bar.beginFill(0xFFFFFF);
    this.bar.drawRect(this.barX+this.bodersLineHeight, this.barY+this.bodersLineHeight, this.bordersWidth*GameManager.instance.game.loader.progress*0.01, this.bordersHeight-this.bodersLineHeight*2);
    this.bar.endFill();
    
  }
}