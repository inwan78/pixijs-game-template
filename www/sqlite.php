<?php
if(isset($_POST["mode"])) {
  $mode = htmlspecialchars($_POST["mode"]);
}
if(isset($_POST["name"])) {
  $name = htmlspecialchars($_POST["name"]);
}
if(isset($_POST["score"])) {
  $score = htmlspecialchars($_POST["score"]);
}
$date = date('Y-m-d');

$db = new MyDB(); 
switch($mode){
  case 0://登録件数カウント
    $sql = 'SELECT * FROM ranking';
    $count = $db->count($sql);
    $array = array("all" => $count);
    echo json_encode($array);
    break;
  case 1://全読み込み(降順)
    $sql = 'SELECT * FROM ranking ORDER BY score DESC';
    $data = $db->select($sql);
    echo json_encode($data);
    break;
  case 2://全読み込み(昇順)
    $sql = 'SELECT * FROM ranking ORDER BY score ASC';
    $data = $db->select($sql);
    echo json_encode($data);
    break;
  case 3://登録処理 
    $sql = "INSERT INTO ranking (
      name, score, created_datetime
    ) VALUES (
      '$name', '$score', '$date')";
    $db->insert($sql);
    break;  
  case 4://スコアのランクを取得(降順)
    $sql = "SELECT * FROM ranking WHERE score > '$score'";
    $rank = $db->count($sql) + 1;
    $sql = 'SELECT * FROM ranking';
    $all = $db->count($sql) + 1;
    $array = array(
      "rank" => $rank,
      "all" => $all
    );
    echo json_encode($array);
    break;
  case 5://スコアのランクを取得(昇順)
    $sql = "SELECT * FROM ranking WHERE score < '$score'";
    $rank = $db->count($sql) + 1;
    $sql = 'SELECT * FROM ranking';
    $all = $db->count($sql) + 1;
    $array = array(
      "rank" => $rank,
      "all" => $all
    );
    echo json_encode($array);
    break;
}
$db->close();

/**
 * sqlite操作クラス
 */
class MyDB extends SQLite3 {
  protected $data;

  //コンストラクタ
  function __construct() {
    $this->open('ranking.db');
  }
  function count($sql){
    $this->data = $this->query($sql);
    $count = 0; 
    while ($row = $this->data->fetchArray()) {$count++;}
    return $count;
  }
  function select($sql){
    $res = [];
    $this->data = $this->query($sql);
    while ($row = $this->data->fetchArray()) {
      $array = array(
        "name" => $row['name'],
        "score" => $row['score'],
        "date" => $row['created_datetime']
      );
      array_push($res, $array); 
      //$res .= $row['name'] . ":" .$row['score'] . ":" .$row['created_datetime'] . "\n" ;
    }
    return $res;
  }
  function insert($sql){
    /**
     * データベースが作られていなかった時の処理
     */
    $query = 'CREATE TABLE IF NOT EXISTS ranking (
      id INTEGER PRIMARY KEY,
      name TEXT, 
      score INTEGER, 
      created_datetime TIMESTAMP 
    )';
    $this->query($query);
    /**
     * 実際の登録処理
     */
    $this->query($sql);
  }
}
?>