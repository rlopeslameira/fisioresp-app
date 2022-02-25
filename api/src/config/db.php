<?php
class db {
  public function connect(){
    
    $username = "drconsultoria18";
    $password = "t130985t";
    $host = "mysql.drconsultoria.uni5.net";
    $dbname = "drconsultoria18";

    try
    {
        $conn = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    }
    catch(PDOException $ex)
    {
        echo "Failed to connect to the database: " . $ex->getMessage();
    }
  }

}
?>