<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';
require 'src/config/db.php';

$configuration = [
    'settings' => [
        'displayErrorDetails' => true,
    ],
];
$c = new \Slim\Container($configuration);

$app = new \Slim\App($c);


$app->get('/', function (Request $request, Response $response, array $args) {
    
    $array = array();
    $array['message'] = "API FisioResp";
    echo json_encode($array);
});

require 'src/routes/medico.php';
require 'src/routes/paciente.php';
require 'src/routes/exercicios.php';
require 'src/routes/chat.php';

$app->run();