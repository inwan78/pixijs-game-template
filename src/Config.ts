const Config = {
  ResourceBaseUrl: 'assets/',
  Screen: { //画面サイズなど
    Width: 640,
    Height: 900,
    BakcgroundColor: 0x000000,
  },
  Volume: { //音のボリューム。値は0~1
    Bgm: 1, 
    Sound: 1,  
  },  
  Strage: { //ローカルストレージ
    Title: 'test'
  },
  Keys: { //キーボード入力
    Up: 87,//w
    Right: 68,//d
    Down: 83,//s
    Left: 65,//a
    A: 78,//n
    B: 77,//m
    Start: 13//Enter
  }
};

export default Config;