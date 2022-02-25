<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->get('/chat', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();

  $sql = " select id as _id, mensagem as text, enviado_por, 
        CONCAT(dataenvio, ' ', horaenvio) as data_hora, sit from chat 
        WHERE paciente = ".$params['paciente']." 
        and usuario = ".$params['medico']." 		 
        and sit <> 'X' 
        Order By dataenvio DESC, horaenvio DESC";
      
  try 
  {
    $bd = new db();
    $conn = $bd->connect();
    $resultado = $conn->query($sql);
    
    $data = $resultado->fetchAll(PDO::FETCH_ASSOC);			

    $mensagens = array();
    foreach($data as $item){  
      
      if ($item['enviado_por'] == 'P')
      {
        $item['user']['_id'] = $params['paciente'];
      }else{
        $item['user']['_id'] = $params['medico'];
      }
                          //Fri Nov 08 2019 16:51:07 GMT-0300
      $item['createdAt'] = (new DateTime($item['data_hora']))->format(DateTime::ATOM);
                //gmdate("D M d Y h:i:s TP");
      $mensagens[] = $item;
    }

    
    echo json_encode($mensagens);	
  }
  catch (Exception $ex) {
    echo json_encode($ex);
  }
});

$app->post('/chat/send', function (Request $request, Response $response, array $args) {  
  
  $params = $request->getQueryParams();
  $dados = $request->getParsedBody();
  $data = array();

  try {

    $mensagem = str_replace("'", "´",addslashes(trim($dados['mensagem'])));

    $bd = new db();
    $conn = $bd->connect();
    
    $chat = " insert into chat (paciente, usuario, mensagem, dataenvio, horaenvio,
      enviado_por) values (" . $dados['paciente'] . ", " . $dados['medico'] . ",
      '" . $mensagem . "', '" . date('Y-m-d') . "', '" . date("H:i:s") . "', '" . $dados['enviado_por'] . "')";
    
    $resultado = $conn->query($chat);   
  
    $data['msg'] = 'Mensagem enviada com sucesso';
    
    $conn = null;

    echo json_encode($data);	

  } catch (Exception $ex) {
    echo $ex;
  }
  
});

?>