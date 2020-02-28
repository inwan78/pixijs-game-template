import GameManager from "./managers/GameManager";

const Resource = Object.freeze({
  /**
   * スプライトアニメーションの情報を返す
   */
  SpriteAnimation:(spriteNames: string[]): string => {
      const query = spriteNames.join('&spriteName[]=');
      return `master/sprite_animation_master.json?spriteName[]=${query}`;
  },
  /**
   * スプライトシートのjsonファイルurlを返す
   */
  Sprite: (spriteName: string): string => {
      return `spritesheets/${spriteName}.json`; 
  },
  SpriteSheetName: {
    Player: "player",
  },
  AnimationSpriteName: {
    Player: "player",
  },
  Image: {
  },
  Sound: {
    //Pause: 'audio/pause.mp3',
    //Ok: 'audio/ok.mp3',
    //Cancel: 'audio/cancel.mp3',
  },
  Bgm: {
    //Main: 'audio/bgm.mp3',
  },
  /**
   * アニメーション種別の識別子を有するオブジェクト
   */
  AnimationTypes: {
    Player: Object.freeze({
      WAIT: 'wait',
      WALK: 'walk',
      ATTACK: 'attack',
      DAMAGE: 'damage',
    }),
  },
  /**
   * スプライトシートの最大フレーム数を返す関数
   */
  MaxFrameIndex: (resourceKey: string): number => {
    const json = GameManager.instance.game.loader.resources[resourceKey];
    if (!json || !json.data || !json.data.frames) {
      return -1;
    }
    return Object.keys(json.data.frames).length;
  },

  /**
   * フォントの設定
   */
  FontFamily: {
    Css: 'base.css',
    Default: 'MisakiGothic'
  },
});

export default Resource;