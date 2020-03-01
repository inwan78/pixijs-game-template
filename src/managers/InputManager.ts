import Config from "../Config";

export default class InputManager {
  //シングルトンインスタンス
  public static instance: InputManager;
  //方向入力チェック用定数
  public static keyDirections = Object.freeze({
    UP: 1,
    UP_RIGHT: 3,
    RIGHT: 2,
    DOWN_RIGHT: 6,
    DOWN: 4,
    DOWN_LEFT: 12,
    LEFT: 8,
    UP_LEFT: 9 
  });
  //キーの状態管理定数
  public static keyStatus = Object.freeze({
    HOLD: 2,
    DOWN: 1,
    UNDOWN: 0,
    RELEASE: -1,
  });
  //キーの状態管理用変数
  public static input = {
    //入力されたキーのチェック用
    keys: {
      Up: false,
      Right: false,
      Down: false,
      Left: false,
      A: false,
      B: false,
      Start: false
    },
    //一つ前のキーの状態管理用
    keysPrev: {
      Up: false,
      Right: false,
      Down: false,
      Left: false,
      A: false,
      B: false,
      Start: false
    }
  };
  constructor() {
    if(InputManager.instance){
      throw new Error('InputManager can be instantiate only once');
    }
  }
  public static init(){
    //InputManagerインスタンス生成
    InputManager.instance = new InputManager();
    document.addEventListener('keydown', (e) => {
      switch(e.keyCode){
        case Config.Keys.Up:
          this.input.keys.Up = true;
          break;
        case Config.Keys.Right:
          this.input.keys.Right = true;
          break;
        case Config.Keys.Down:
            this.input.keys.Down = true;
            break;
        case Config.Keys.Left:
          this.input.keys.Left = true;
          break;
        case Config.Keys.A:
          this.input.keys.A = true;
          break;
        case Config.Keys.B:
          this.input.keys.B = true;
          break;
        case Config.Keys.Start:
          this.input.keys.Start = true;
          break;
      }
    });
    document.addEventListener('keyup', (e) => {
      switch(e.keyCode){
        case Config.Keys.Up:
          this.input.keys.Up = false;
          break;
        case Config.Keys.Right:
          this.input.keys.Right = false;
          break;
        case Config.Keys.Down:
            this.input.keys.Down = false;
            break;
        case Config.Keys.Left:
          this.input.keys.Left = false;
          break;
        case Config.Keys.A:
          this.input.keys.A = false;
          break;
        case Config.Keys.B:
          this.input.keys.B = false;
          break;
        case Config.Keys.Start:
          this.input.keys.Start = false;
          break;
      }
    });
  }
  //方向キー入力チェック
  public static checkDirection() {
    let direction = 0;//初期化
    if(this.input.keys.Up){
        direction += this.keyDirections.UP;
    }
    if(this.input.keys.Right){
      direction += this.keyDirections.RIGHT;
    }
    if(this.input.keys.Down){
      direction += this.keyDirections.DOWN;
    }
    if(this.input.keys.Left){
      direction += this.keyDirections.LEFT;
    }
    return direction;
  }
  //ボタンの入力状態をチェックして返す
  public static checkButton(key: string) {
    if(this.input.keys[key]){
      if(this.input.keysPrev[key] == false){
        this.input.keysPrev[key] = true;
        return this.keyStatus.DOWN;//押されたとき
      }
      return this.keyStatus.HOLD;//押しっぱなし
    }else{
      if(this.input.keysPrev[key] == true){
        this.input.keysPrev[key] = false;
        return this.keyStatus.RELEASE;//ボタンを離した時
      }
      return this.keyStatus.UNDOWN;//押されていない
    }
  }
}
 
