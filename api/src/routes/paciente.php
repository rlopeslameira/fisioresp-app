<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->post('/paciente/login', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  $dados = $request->getParsedBody();

  $sql = " Select * FROM paciente WHERE email = '" . addslashes($dados["email"]) . "' and ativo = 1";	

  $bd = new db();
  $conn = $bd->connect();
  $resultado = $conn->query($sql);

  $data = $resultado->fetch(PDO::FETCH_ASSOC);			

  if ($data) 
  {    
    if ($data['senha'] === $dados['senha'])
    {
      echo json_encode($data);
    }else{      
      echo json_encode($data);
    }
  }else{    
    echo json_encode($data);
  }    
});

$app->get('/paciente/lista', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  $dados = $request->getParsedBody();

  $sql = " Select *, DATE_FORMAT(datanascimento, '%d/%m/%Y') as datanascimento, datanascimento as dataf FROM paciente WHERE medico = " . $params["medico"] . " and ativo = 1";	

  $bd = new db();
  $conn = $bd->connect();
  $resultado = $conn->query($sql);

  $data = $resultado->fetchAll(PDO::FETCH_ASSOC);			
      
  echo json_encode($data);
  
});

$app->post('/paciente', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  $dados = $request->getParsedBody();
  

  $imagem = $dados["imagem"] == NULL ? 'NULL' : "'" . $dados["imagem"] . "'";
  
  $sql = " insert into paciente (email, senha, name, datanascimento, contatos, " .
    " endereco, bairro, cidade, estado, imagem, ativo, medico) values (".
      "'" . addslashes($dados["email"]) . "',
      '" . $dados["senha"] . "',
      '" . addslashes($dados["name"]) . "',
      '" . $dados["dataf"] . "',
      '" . addslashes($dados["contatos"]) . "',
      '" . addslashes($dados["endereco"]) . "',
      '" . addslashes($dados["bairro"]) . "',
      '" . addslashes($dados["cidade"]) . "',
      '" . addslashes($dados["estado"]) . "',      
      " . $imagem . ",
      '1', ".$dados["medico"].")";	

  try{
    
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    
    $conn = null;

    echo json_encode($dados);
  } catch (Exception $err){
    echo json_encode($err);
  }
});

$app->put('/paciente', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  $dados = $request->getParsedBody();
  
  $imagem = $dados["imagem"] == NULL ? 'NULL' : "'" . $dados["imagem"] . "'";

  $sql = " update paciente set 
        email = '" . addslashes($dados["email"]) . "',
        senha = '" . $dados["senha"] . "',
        name = '" . addslashes($dados["name"]) . "',
        datanascimento = '" . $dados["dataf"] . "',
        contatos = '" . addslashes($dados["contatos"]) . "',
        endereco = '" . addslashes($dados["endereco"]) . "',
        bairro = '" . addslashes($dados["bairro"]) . "',
        cidade = '" . addslashes($dados["cidade"]) . "',
        estado = '" . addslashes($dados["estado"]) . "',
        imagem = " . $imagem . ",
        ativo = '1', medico = ".$dados["medico"] .
        ' where id = ' . $dados["id"];	

  try{
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    echo json_encode($dados);
  } catch (Exception $err){
    echo json_encode($sql);
  }
});

$app->post('/paciente/evolucao', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  $dados = $request->getParsedBody();
  try{

    $bd = new db();
    $conn = $bd->connect();

    $del = "delete from evolucao_detalhe where evolucao = " . $dados["evolucao"] ;
    $resultado = $conn->query($del);

    $del = "delete from evolucao where paciente = " . $dados["paciente"] . " and data = '" .date('Y-m-d'). "'";
    $resultado = $conn->query($del);

    $sql = " insert into evolucao (paciente, data, pontos) values ".
        "(".$dados["paciente"] . ", ".
        "'" . date('Y-m-d') . "', ".
        $dados["pontos"] . ")";	
  

    $resultado = $conn->query($sql);
    $id = $conn->lastInsertId();
    
    $sql =  'insert into evolucao_detalhe (evolucao, exercicio, series, repeticoes, porcentagem, finalizado) 
    values';
    
    $lista = $dados['lista'];

    foreach ($lista as $item) {
        $sql .= "(" . $id . ", " . $item['id'] . ",
        '" . $item["series"] . "', 
        '" . $item['repeticoes'] . "', '" . $item['porcentagem'] . "',
        '" . $item['finalizado'] . "'),";    
    }
    
    if (count($lista) > 0)
    {
        $sql = substr($sql, 0, -1);
        $resultado = $conn->query($sql);           
    }
    $return = array();
    $return["id"] = $id;
    $return["success"] = true;
    $return["lista"] = $dados['lista'];
    $conn = null;

    echo json_encode($return);
  } catch (Exception $err){
    $return = array();
    echo json_encode($err);
  }
});

$app->get('/paciente/evolucao/dia', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  
  $sql = " select data from evolucao where paciente = " . $params["paciente"] . " and data = '" . date('Y-m-d') . "';";	

  try{
    
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);

    $conn = null;

    echo json_encode($data);
  } catch (Exception $err){
    $return = array();
    echo json_encode($err);
  }
});

$app->get('/paciente/evolucao/mes', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  
  $sql = " select * from evolucao where paciente = " . $params["paciente"] . " and MONTH(data) = " . $params["month"] ;	

  try{
    
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);

    $conn = null;

    echo json_encode($data);
  } catch (Exception $err){
    $return = array();
    echo json_encode($err);
  }
});

$app->get('/paciente/evolucao/load', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  
  $sql = " select ed.*, ex.titulo, e.pontos AS total from evolucao e
    INNER JOIN evolucao_detalhe ed
    ON ed.evolucao = e.id
    INNER JOIN exercicios ex
    ON ex.id = ed.exercicio
    where paciente = " . $params["paciente"] . " 
    and data = '" . $params["data"] . "';";	

  try{
    
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);

    $conn = null;

    echo json_encode($data);
  } catch (Exception $err){
    $return = array();
    echo json_encode($err);
  }
});

$app->get('/paciente/evolucao', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  
  $sql = " select data from evolucao e
    where paciente = " . $params["paciente"] . " 
    and MONTH(data) = " . $params["mes"] . ";";	

  try{
    
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);
    $conn = null;

    echo json_encode($data);
  } catch (Exception $err){
    $return = array();
    echo json_encode($err);
  }
});