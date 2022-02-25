<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->get('/exercicios', function (Request $request, Response $response, array $args) {  
  
    $dados = $request->getQueryParams();

    $sql = "Select e.*, ep.paciente, ep.detalhes AS obs, ep.series, ep.repeticoes FROM exercicios e
    Left Join exercicios_paciente ep
    On ep.exercicio = e.id
    And ep.paciente = " . $dados["paciente"];

    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);

    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);			
    echo json_encode($data);   
});

$app->get('/exercicios/paciente', function (Request $request, Response $response, array $args) {  
  
    $dados = $request->getQueryParams();

    $sql = "Select e.*, ep.paciente, ep.detalhes AS obs,  ep.series, ep.repeticoes FROM exercicios e
    Inner Join exercicios_paciente ep
    On ep.exercicio = e.id 
    And ep.paciente = " . $dados["paciente"];	

    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);

    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);			
    echo json_encode($data);   
});

$app->post('/exercicios', function (Request $request, Response $response, array $args) {  
  
    $dados = $request->getParsedBody();
    $params = $request->getQueryParams();
  
    try {
    
        $bd = new db();
        $conn = $bd->connect();
        
        $lista = $dados['lista'];

        $delete = 'delete from exercicios_paciente where paciente = ' . $dados['paciente'];
        $resultado = $conn->query($delete); 

        $sql =  'insert into exercicios_paciente (paciente, exercicio, detalhes, series, repeticoes) values ' ;

        foreach ($lista as $item) {
            // $detalhes = str_replace("'", "´",addslashes(trim($dados['detalhes'])));
            $detalhes = '';
            $sql .= "(" . $dados['paciente'] . ", " . $item['id'] . ",
            '" . $detalhes . "', '" . $item['series'] . "', '" . $item['repeticoes'] . "'),";    
        }
        
        if (count($lista) > 0)
        {
            $sql = substr($sql, 0, -1);
            $resultado = $conn->query($sql);           
        }
        
        $conn = null;
    
        echo json_encode('Dados gravados com sucesso');	
  
    } catch (Exception $ex) {
      echo $ex;
    }
    
  });