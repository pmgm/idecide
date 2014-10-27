<?php
header('Access-Control-Allow-Origin: http://www.icanplan4safety.ca');
/* header must be first, therefore cannot get its origin from includes/idecide.inc.php
/* interface for incoming requests from idecide */
/* https://<idecideregistration>/com/interfaceConfirmNewUser.php?pid=5
 * where pid = participant_id
 */
/* This file gathers the pid request and updates the participant table if:
 * + the participant_id corresponding to pid exists
 * + the participant is eligible,
 * + has consented to participate,
 * + has enrolled and
 * + the participant has not already been confirmed by this process
 */
require_once(dirname(__FILE__) . "/../lib/find_path.inc.php");
require_once($_SERVER["DOCUMENT_ROOT"] . LIBPATH . "/includes/dbconnect.inc.php");
require_once($_SERVER["DOCUMENT_ROOT"] . LIBPATH . "/lib/pmgmCRUD/pmgmCRUD.php");

/* connect to database */
$table = 'participant';
$returnid = -2;
try {
  $conn = new PDO(DBCONNECT, DBUSER, DBPASS);
  $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  /* no point in the rest of it if $conn doesn't work */
  $dao = new PmgmDao($conn);
  if (isset($_REQUEST["pid"])) {
    $participant_id = (int)$_REQUEST["pid"];
    $participant_list = $dao->getListFromDB($table, array('participant_id' => $participant_id));
    if (! empty($participant_list)) {
      $participant_info = $participant_list[0];
      if ($participant_info->eligible == 'yes' and
	  $participant_info->consent == 'yes' and
	  $participant_info->confirmed != 'yes' and
	  ! empty($participant_info->enrolled) ) {
	/* update the confirmed field to 'yes' */
	$returnid = $dao->updateThing($table, $participant_id, array('confirmed' => 'yes'));
      }
    }
  }
}
catch(PDOException $e) {
  echo('ERROR: ' . $e->getMessage());
  $conn = null;
}
/* for testing */
/*echo($returnid);*/
?>