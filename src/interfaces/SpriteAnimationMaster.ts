export type SpriteAnimationTypeIndex = 'wait' | 'walk' | 'attack' | 'jump' | 'damage' | 'test';
/**
 * ユニットアニメーションマスターのスキーマ定義
 */
export default interface SpriteAnimationMaster {
  spriteName: string;
  types: {
    [key in SpriteAnimationTypeIndex]: {
      updateDuration: number;
      frames: string[];
    }
  };
}