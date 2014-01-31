<?php
$url = "http://services.encomendaz.net/tracking.json?id=".$_GET['id'];

$ch = curl_init();
// Disable SSL verification
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
// Will return the response, if false it print the response
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Set the url
curl_setopt($ch, CURLOPT_URL,$url);
// Execute
$result=curl_exec($ch);

// Will dump a beauty json :3
//echo json_decode($result, true);
echo $result;
?>