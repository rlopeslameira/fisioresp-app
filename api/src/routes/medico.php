<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->post('/usuario/login', function (Request $request, Response $response, array $args) {  
  
  $dados = $request->getParsedBody();

  $sql = " select id, senha, 'medico' AS tipo FROM medico
  WHERE email = '" . addslashes($dados["email"]) . "' and ativo = 1
  UNION 
  Select id, senha, 'paciente' AS tipo FROM paciente
  WHERE email = '" . addslashes($dados["email"]) . "' and ativo = 1 ";	

  $bd = new db();
  $conn = $bd->connect();
  $resultado = $conn->query($sql);

  $data = $resultado->fetch(PDO::FETCH_ASSOC);			

  if ($data) 
  {    
    if ($data['senha'] === $dados['senha'])
    {

      if ($data['tipo'] == 'medico')
      {
        $sql = " select *, 'medico' as tipo FROM medico WHERE id = " . $data["id"];
        $resultado = $conn->query($sql);
        $data = $resultado->fetch(PDO::FETCH_ASSOC);
      }else{
        $sql = " select *, 'paciente' as tipo FROM paciente WHERE id = " . $data["id"];
        $resultado = $conn->query($sql);
        $data = $resultado->fetch(PDO::FETCH_ASSOC);
      }

      echo json_encode($data);
    }else{      
      echo json_encode(null);
    }
  }else{    
    echo json_encode($data);
  }    
});

$app->post('/usuario', function (Request $request, Response $response, array $args) {  
  
  $dados = $request->getParsedBody();

  $foto = '';
  if ($dados["foto"] !== NULL)
  {
    $foto = "'".$dados["foto"] . "'";
  }else{
    $foto = 'null';
  }
  
  $sql = " insert into medico (email, senha, nome, cidade, estado, foto) values ('" . addslashes($dados["email"]) . "',
      '" . $dados["senha"] . "',
      '" . addslashes($dados["nome"]) . "',
      '" . addslashes($dados["cidade"]) . "',
      '" . addslashes($dados["estado"]) . "',
      " . $foto . ");";	

  try{
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    echo json_encode($dados);
  } catch (Exception $err){
    echo json_encode($err);
  }
});

$app->put('/usuario', function (Request $request, Response $response, array $args) {  
  
  $dados = $request->getParsedBody();
  //echo json_encode($dados);

  $foto = '';
  if ($dados["foto"] !== NULL)
  {
    $foto = "'".$dados["foto"] . "'";
  }
  
  $sql = " update medico set email = '" . addslashes($dados["email"]) . "',
      senha = '" . $dados["senha"] . "',
      nome = '" . addslashes($dados["nome"]) . "',
      cidade = '" . addslashes($dados["cidade"]) . "',
      estado = '" . addslashes($dados["estado"]) . "',
      foto = " . $foto . "
      where id = " . $dados["id"] ;	

  try{
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    echo json_encode($dados);
  } catch (Exception $err){
    echo json_encode($err);
  }
});

$app->get('/medico', function (Request $request, Response $response, array $args) {
  
  $params = $request->getQueryParams();
  
  $sql = " Select id, nome FROM medico WHERE id = " . $params["medico"];	

  $bd = new db();
  $conn = $bd->connect();
  $resultado = $conn->query($sql);

  $data = $resultado->fetch(PDO::FETCH_ASSOC);      
  echo json_encode($data);  
});