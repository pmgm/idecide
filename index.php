<?php
/**
 * The instance script to run a idecide app
 *
 * @author Patrick Maslen <pmaslen@unimelb.edu.au>
 */
//session_name('idecide');
//session_start();
require_once(dirname(__FILE__) . "/lib/find_path.inc.php");
require_once($_SERVER["DOCUMENT_ROOT"] . LIBPATH . "/lib/cgiapps/idecide.class.php");

$template_path = $_SERVER["DOCUMENT_ROOT"] . LIBPATH . '/tpl/';
// template_params must at minimum include 'filename' keyword
session_start();
$title = "I-DECIDE";
//$title_attributes = "";
$template_params = array(
		'filename' => 'base.html',
	  	'title' => $title,
	  	'extra_style' => array( ),
	  	'extra_script' => array(
			array( )
			)
	);
$params = array(
	'template_path' => $template_path,
	'template_params' => $template_params
	 );
$webapp = new Idecide(array('PARAMS' => $params));
$webapp->run(); 
?>
