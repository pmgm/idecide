<?php
/**
 * idecide.class.php
 * a subclass of cgiapp2
 * an app to access the iDecide survey system
 *
 * @author Patrick Maslen (pmaslen@unimelb.edu.au)
 *
 * uses Twig templating system, without the cgiapp2 interface to same
 * Also requires PDO
 */
/**
 * required files
 */
require_once(dirname(__FILE__) . "/../../lib/find_path.inc.php");
require_once($_SERVER["DOCUMENT_ROOT"] . LIBPATH . "/lib/addons/Cgiapp2-2.0.0/Cgiapp2.class.php");
require_once($_SERVER["DOCUMENT_ROOT"] . LIBPATH . "/lib/addons/Twig/lib/Twig/Autoloader.php");
require_once($_SERVER["DOCUMENT_ROOT"] . LIBPATH . "/includes/dbconnect.inc.php");
class Stationery extends Cgiapp2 {
  /**
   * @var array(string mode_name => string description) $run_modes_default_text
   * default text to appear in links to the visible run modes
   */
  private $run_modes_default_text;
  /**
   * @var object $twig
   * Twig environment for templates
   * In this case the template environment may be
   * simpler to install than the template interface
   */
  private $twig;
  /**
   * @var object $loader
   * loader for twig environment
   */
  private $loader;
  /** 
   * @var object $conn
   * PDO database connection
   */
  private $conn;
  /**
   * @var error
   * error messages
   */
  private $error;
  /** 
   * @var action
   * default action for forms
   */
  private $action;

  /**
   * @var $select, $insert, $update, $delete
   * arrays to store prepared sql statements used by the program
   */
   private $select;
   private $insert;
   private $update;
   private $delete;

   function setup() {
    /** 
     * database
     */
    // $this->dbconnect_string = DBCONNECT;
    /* should put some error catching here */
    try {
      $this->conn = new PDO(DBCONNECT, DBUSER, DBPASS);
      $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
      $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch(PDOException $e) {
      $this->error = 'ERROR: ' . $e->getMessage();
      $this->conn = null;
    }
    /** 
     * template
     */
 
   /*prepare Twig environment */
    Twig_Autoloader::register();
    if ($this->param('template_path')) {
	$this->template_path = $this->param('template_path');
    }
    $this->loader = new Twig_Loader_Filesystem($this->template_path);
    /* for testing, 
     * make auto_reload true and cache false
     */
    $twig_options = array(
		      "auto_reload" => false
		      );
    if (is_dir($_SERVER["DOCUMENT_ROOT"] . LIBPATH . 'twigcache')) {
      $twig_options['cache'] = 'twigcache';
    }
    else {
      $twig_options['cache'] = false;
    }
    
    $this->twig = new Twig_Environment($this->loader, $twig_options);
    /* allows twig to parse object values as arrays */
    $this->twig->addFilter(new Twig_SimpleFilter('cast_to_array', function ($stdClassObject) { return (array)$stdClassObject; }));
    $tpl_params = $this->param('template_params');
    $this->template_filename = $tpl_params['filename'];
    
    /**
     * set up the legal run modes => methods table
     * note that login screen is handled outside of the app
     * these run modes assume access is allowed
     * (see passport)
     */
    $this->run_modes(array(
			   'start' => 'showStart',
			   'eligible' => 'determineEligibility'
			   ));
    // should be an entry for each of the run modes above
    $this->run_modes_default_text = array(
					  'start' => 'Home'
					  );
    $this->user_visible_modes = array();
    $admin_visible = array();
    $this->start_mode('start');
    $this->error_mode('handle_errors');
    $this->mode_param('mode');
    $this->action = $_SERVER['SCRIPT_NAME'];
    $this->sqlstatements();
  }
 
  /**
   * setup PDO prepared sql statements for use by the program
   * arrays of SELECT, INSERT, UPDATE and DELETE statements
   * this function is a convenient holder for all the SQL 
   * to prevent duplication
   */
  private function sqlstatements() {
    $this->select = array(
			  'SELECT * FROM user WHERE username = :id',
			  'SELECT name, acronym, department_id FROM department ORDER by acronym',
			  'SELECT department_id from user_department where username = :id',
			  "SELECT * FROM template WHERE category_id = :category_id AND department_id in ( jjjdepartments ) OR category_id = :category_id2 AND department_id IS NULL ORDER BY full_name ASC",
			  'SELECT * FROM job WHERE username = :username ORDER BY job_id DESC LIMIT 1',
			  'SELECT j.job_id, j.username, c.description FROM job j, category c, template t WHERE t.template_id = j.template_id AND t.category_id = c.category_id and j.job_id = :job_id',
			  'SELECT id FROM template WHERE template_id = :template_id AND chili_id = :chili_id',
			  'SELECT t.full_name FROM template t, job j WHERE j.job_id= :job_id and j.template_id = t.template_id',
			  'SELECT quantity, sell_price as price_AUD FROM customer_price_view WHERE category_id = :category_id',
			  'SELECT * FROM address where address_id = :address_id',
			  "SELECT * FROM template WHERE category_id = :category_id AND department_id IS NULL ORDER BY full_name ASC",
			  'SELECT * from user_group where group_id = 1 and username = :username'
			  );
    $this->insert = array(
			  'INSERT INTO user VALUES(:username, :firstname, :lastname, :telephone, :email, DEFAULT);',
			  'INSERT INTO user_department VALUES(:username, :department_id)',
			  'INSERT INTO job (job_id, username, template_id) VALUES(DEFAULT, :username, :template_id)',
			  'INSERT INTO address(address_id, addressee, location, street_number, street, town, postcode) VALUES (DEFAULT, :addressee, :location, :street_number, :street, :town, :postcode)',
			  'INSERT INTO :entity (xxx) VALUES (yyy)'
			  );
    $this->update = array(
			  'UPDATE user SET given_name = :firstname, family_name = :lastname, phone = :phone, email = :email WHERE username = :id',
			  'UPDATE job SET chili_id = :chili_id WHERE username = :username AND job_id = :job_id',
			  'UPDATE :entity SET xxx WHERE entity_id = :id'
			  );
    $this->delete = array(
			  'DELETE FROM user_department WHERE username = :username AND department_id = :department_id'
			  );
  }
  /**
   * function to shut everything down after the app has run
   */
  function teardown() {
    // close database connection
      $this->conn = null;
  }  
  /**
   * error handling
   * an Exception gets sent to this function
   */
  function handle_errors($e) {
    $error = '<pre>ERROR: ' . $e->getMessage() . '</pre>';
    $t = 'base.html';
    $t = $this->twig->loadTemplate($t);
    $output = $t->render(array(
			       'modes' => $this->user_visible_modes,
			       'error' => $error
			       ));
    return $output;
  }
  /**
   * mode functions here
   */
  /**
   * showStart
   * Starting page -- shows instructions on how to use the app.
   * redirect to showProfile if no profile is defined locally
   * for this username ($_SESSION["username"])
   */
  /* get info about a user. Used in final and showprofile */
  /* returns false if no matched profile */

  function showStart() {
    /* check database for user name */
    $error = $this->error;
    $starturl = $this->action . '&mode=eligible';
    $t = 'start.html';
    $t = $this->twig->loadTemplate($t);
    $output = $t->render(array(
			       'starturl' => $starturl,
			       'modes' => $this->user_visible_modes,
			       'error' => $error
			       ));
    return $output;
  }
/* similar to addAddress above but more generic
 * thing is an entity name, eg. template, department
 * thing_details is an array of (property_name => property_value)
 * for the thing
 * returns the id of the new thing
 */
private function addThing($thing, $thing_details) {
  $thing_id = -1;
  $statement = $this->insert[4];
  $column_names = array_keys($thing_details);
  $statement = str_replace('xxx', implode(', ', $column_names), $statement);
  $statement = str_replace('yyy', ':yyy', $statement);
  $statement = str_replace('yyy', implode(', :', $column_names), $statement);
  $statement = str_replace(':entity', $thing, $statement);
try {
      $stmt = $this->conn->prepare($statement);
      $stmt->execute($thing_details);
}
    catch (Exception $e) {
      $this->error = '<pre>ERROR: ' . $e->getMessage() . '</pre>';
      $thing_id = false;
    }
    /* get address id for address just created */
    if ($thing_id !== false) {
      $thing_id = $this->conn->lastInsertId();
    }

    return $thing_id;  
}

/* general updater
 * $thing is the entity (a string, lowercase)
 * $thing_id is an integer,
 * or an array of integers (for IN clause)
 * or an associative array of identifying columns:
 * column=>values which together define a unique table entry
 * for those tables with no primary key.
 * $thing_details is an array of column=>value
 */
private function updateThing($thing, $thing_id, $thing_details) {
  //print_r($thing_details);
  //print_r($thing_id);
  $returnid = -1;
  /* get settext */
   $settings = array();
    $statement = "";
    $conditions = array();
    foreach ($thing_details as $key => $value) {
      if (is_string($value))
	{
	  $value = trim($value);
	  if (strlen($value) == 0)
	    {
	      $value === null;
	    }
	}
      $lcasekey = $key; // don't need lower case
      $settings[] = $lcasekey . " = " . ":" . $lcasekey;
    }
    $settext = implode(", ", $settings);
    //print_r("settext: $settext\n");
    $conditions = array();
    if (is_array($thing_id) && $this->is_assoc($thing_id)) {
	/* no primary key, build $keytext from columns */
	foreach ($thing_id as $column_name => $value) {
	  $conditions[] = $column_name . " = " . $value;
	  }
	//print_r($conditions);
	$keytext = implode(" AND ", $conditions);
	$returnid = $thing_details;
    }
    else {
      $primary_key = strtolower($thing) . '_' . 'id';
      $conditions[$primary_key] = $thing_id;
      $keytext = $this->makeConstraintSQL($conditions);
      $returnid = $thing_id;
    }

    //$keytext = $primary_key . " = :" . $primary_key;
    $statement = "update $thing set " . $settext . " where " . $keytext;

    //print_r($statement);
    //print_r($thing_details);
    try {
      $stmt = $this->conn->prepare($statement);
      $stmt->execute($thing_details);
 
     }
    catch(Exception $e) {
      $this->error .= '<pre>ERROR: ' . $e->getMessage() . '</pre>';
    }
    return $returnid;
}
/* deletes from database
 * $thing is the entity name 
 * $id can be an integer or array of integers,
 * representing an IN clause 
 * or an array of arrays,
 * each representing a record,
 * if there is no primary key to be deleted
 */
protected function deleteThings($thing, $id) {

  $conditions = $id;
  $keytext = $this->makeConstraintSQL($conditions);
  $statement = "delete from $thing where " . $keytext;
  //print_r($statement);
  try {
    $stmt = $this->conn->prepare($statement);
    $stmt->execute();
  }
  catch (Exception $e) {
    $this->error .= '<pre>ERROR: ' . $statement . ': ' . $e->getMessage() . '</pre>';
  }
}

/* helper function to determine if an array is associative
 * from Captain kurO, http://stackoverflow.com/questions/173400/php-arrays-a-good-way-to-check-if-an-array-is-associative-or-sequential
 * assumes:
 * 
 * is_array($array) == true
 * If there is at least one string key, 
 * $array will be regarded as associative array
 * so it just checks for string keys, not true check for associative,
 * but enough for this program
 */
private function is_assoc($array) {
  return (bool)count(array_filter(array_keys($array), 'is_string'));
}

/* returns formatted email headers
 * $extra_headers_array are additional mail headers, eg.
 * "cc" => "bob.sackamento@bob.com"
 */
private function email_headers($extra_headers_array) {
  $header_array = array('From' => ADMIN_EMAIL);
  if (is_array($extra_headers_array)) {
    foreach($extra_headers_array as $label=>$value) {
      $header_array[$label] = $value;
    }
  }

  $expanded_headers = array();

  foreach($header_array as $label=>$value)
    {
      $expanded_headers[] = $label . ': ' . $value;
    }
  $headers = implode("\r\n", $expanded_headers);
  return $headers;
}
/* Admin functions */
/* $table is the name of the table
 * $conditions is an array of context-specific WHERE clause conditions eg.
 * ('id' => 1, username = 'godzilla') or
 * ('id' => array(1,2,3,4)) for a WHERE...IN clause
 * $ordering a string or array of column names for ORDER BY...
 * returns an array of objects
 */
private function getListFromDB($table, $conditions = null, $ordering = null) {
  $entity_list = array();
  $sql = "SELECT * from $table";
  if(is_array($conditions) and !empty($conditions)){
    $sql .= ' WHERE ' . $this->makeConstraintSQL($conditions);
  }
  if (!is_null($ordering)){
    $sql .= ' ' . $this->makeOrderingSQL($ordering);
  }
  //print_r($sql);
  try {

    $stmt = $this->conn->prepare($sql);
    $stmt->execute(array());
    while($row = $stmt->fetch(PDO::FETCH_OBJ)) {
      array_push($entity_list, $row);
    }
  }
  catch(Exception $e) {
    $this->error = '<pre>ERROR: ' . $e->getMessage() . '</pre>';
  }
  return $entity_list;
}
/* $conditions is an array (column=>value)
 * if value is an array it is made into an IN clause
 * if $conditions is an array of arrays
 * then each sub-array is evaluated **recursively** 
 * as an OR clause
 */
private function makeConstraintSQL($conditions) {
  $keytext = "";
  $all_keytext = array();
  $key_conditions = array();
  if (is_array($conditions)) {
    if ($this->is_assoc($conditions)){
      foreach ($conditions as $column_name => $value) {
	$final_value = "";
	$operator = ' = ';
	if (is_array($value)) {
	  $operator = ' IN ';
	  $final_value .= '(';
	  foreach ($value as $item)
	    {
	      if (is_string($item)) {
		$item = $this->conn->quote($item);
	      }
	      $final_value .= $item . ', ';
	    }
	  $final_value = rtrim($final_value, ', ');
	  $final_value .= ')';
	}
	else {
	  if (is_string($value)) {
	    $value = $this->conn->quote($value);
	  }
	  $final_value = $value;
	}
	$key_conditions[] = strtolower($column_name) . $operator . $final_value;
      }
    }
    else {
      foreach ($conditions as $cond) {
	if (is_array($cond)) {
	  /* create OR clauses for multiple 
	   * arrays of column=>value */
	  $all_keytext[] = $this->makeConstraintSQL($cond);
	}
      }
    }
    
  }
  $keytext = implode(" AND ", $key_conditions);
  if(count($all_keytext) > 0) {
    $keytext = implode(" OR ", $all_keytext);
  }
  return $keytext;
}
/**
 * adds an ordering clause to a SQL statement
 * @param array(string) or simple string $ordering, a list of columns to order the query by
 * For convenience, a single term need not be enclosed in an array
 * @return string
 */
private function makeOrderingSQL($order_by) {
  $all_columns = "";
  if (is_array($order_by))
    {
      foreach ($order_by as $column_name)
	{
	  $all_columns .= $column_name . ', ';
	}
      $all_columns = rtrim($all_columns, ', ');
    }
  else
    {
      $all_columns = $order_by;
    }
  return 'ORDER BY ' . $all_columns;
}
/* a generic overview of some entity (default = template) */
function modifyTemplate() {
  if (!$this->isAdmin()) {
    return $this->showStart();
  }
  $entity = 'Template';
  if (isset($_REQUEST['entity'])) {
    $entity = strtolower($_REQUEST['entity']);
    
  }
  $plural = $this->pluralise($entity);

  if (isset($_REQUEST['parent_entity']) && isset($_REQUEST['parent_id'])){
    $parent_entity = $_REQUEST['parent_entity'];
    $parent_id = $_REQUEST['parent_id'];
    $conditions = array(strtolower($parent_entity) . '_id' => $parent_id);
    $edit_addition = 'parent_entity='.$parent_entity.'&parent_id='.$parent_id;
    $add_addition = '&' . $edit_addition;
  }
  else {
    $conditions = null;
    $edit_addition = "id=";
    $add_addition = "";
  }

  try {
    $template_list = $this->getListFromDB(strtolower($entity . '_view'), $conditions, null);
    /* make sure unimelb templates are visible in view */
    $properties = array();
    if(count($template_list) > 0 ){
      $properties1 = array_keys(get_object_vars($template_list[0]));
      $properties = str_replace('_', ' ', $properties1);
      
      
    }
  }
  catch(Exception $e) {
    return $this->handle_errors($e);
  }
  $editurl = $this->action . "?mode=update_item&entity=$entity&" . $edit_addition ;
  $deleteurl = $this->action . "?mode=delete&entity=$entity" . $add_addition;
  $addurl = $this->action . "?mode=add_item&entity=$entity" . $add_addition;
  /* screen output*/
  $t = 'admin-list.html';
  $t = $this->twig->loadTemplate($t);
  $output = $t->render(array(
			     'modes' => $this->user_visible_modes,
			     'error' => $this->error,
			     'entity' => $entity,
			     'properties' => $properties,
			     'columns' =>$properties1,
			     'item_list' => $template_list,
			     'addurl' => $addurl,
			     'editurl' => $editurl,
			     'action' => $deleteurl,
			     'plural' => $plural
			     ));
  return $output;
}

/* give the user confirmation before deletion 
 * needs: 
 * the Entity type to delete, (also gives where to return to on submit or cancel)
 * the id number of the thing(s) to delete
 * submit (deletes) or cancel (return to origin)
 */
function confirmDelete() {
  //print_r($_REQUEST);
  $action = $this->action;
  $entity = strtolower($_REQUEST['entity']);
  $to_delete = array();
  $needle = 'markdelete' . ($entity);
  $needle2 = '---'; 
 foreach($_REQUEST as $key => $value) {
    if(strpos($key, $needle) !== false) {
      if(strpos($value, $needle2) !== false) {
	$id_properties = explode($needle2, $value);
	//print_r ($id_properties);
	$final_value = array();
	foreach($id_properties as $prop) {
	  //print_r('\n' . $prop);
	  /* convert 'id[x]=y'
	   * to x => y */
	  $first = strpos($prop, ':');
	  $firstly = substr($prop, 0, $first);
	  $secondly = substr($prop, $first +1);
	  $final_value[$firstly] = $secondly;
	} 
	$value = $final_value;
      }
      $to_delete[] = $value;
    }
  }
 //print_r($to_delete);

  if (isset($to_delete[0])) {
    if(is_array($to_delete[0])){
      /* no primary key */
      $conditions = $to_delete;
      $delete_conditions = $to_delete;
    }
    else {
      /* primary key, an integer */
      $conditions = array('id' => $to_delete);
      $delete_conditions = array($entity . '_id' => $to_delete);
    }
  }
  else {
    $conditions = array('id' => -1);
    $delete_conditions = array($entity . '_id' => -1);
  }
  //print_r($conditions);
  //print_r($delete_conditions);
  if(isset($_REQUEST['submitted_confirm'])) {
    /* delete listed things */
    $this->deleteThings($entity, $delete_conditions);
    //return $this->modifyTemplate();
  }
  $returnurl = $this->action . '?mode=' . $entity .'_admin';
  $confirmurl = $this->action . '?mode=delete&entity=' . $entity;
if (isset($_REQUEST['parent_entity']) && isset($_REQUEST['parent_id'])){
    $parent_entity = $_REQUEST['parent_entity'];
    $parent_id = $_REQUEST['parent_id'];
    $conditions = array(strtolower($parent_entity) . '_id' => $parent_id);
    $extra = '&parent_entity='.$parent_entity.'&parent_id='.$parent_id;
    $returnurl .= '&entity='. $entity . $extra;
    $confirmurl .= $extra;
}
else {
  $parent_entity = null;
  $parent_id = null;
}

  $item_list = $this->getListFromDB(strtolower($entity . '_view'), $conditions, null);
  /* make sure unimelb templates are visible in view */
  $properties = array();
  if(count($item_list) > 0 ){
    $properties1 = array_keys(get_object_vars($item_list[0]));
    $properties = str_replace('_', ' ', $properties1);
  }
  /* screen output*/
  $t = 'admin-delete.html';
  $t = $this->twig->loadTemplate($t);
  $output = $t->render(array(
			     'modes' => $this->user_visible_modes,
			     'error' => $this->error,
			     'entity' => $entity,
			     'action' => $confirmurl,
			     'returnurl' => $returnurl,
			     'properties' => $properties,
			     'item_list' => $item_list,
			     'id_list' => $to_delete,
			     'parent_entity' => $parent_entity,
			     'parent_id' => $parent_id
			     ));
  return $output; 

}
/* a generic function to add or edit entity details
 * gets all fields from the specified Entity
 * when submitted, adds the Entity, returns to the appropriate list page
 */
function addItem() {
  parse_str($_SERVER['QUERY_STRING'], $query);
  //print_r($query);
  //print_r($_REQUEST);
  if (isset($_REQUEST['entity'])) {
    $entity = strtolower($_REQUEST['entity']);
  }
  else {
    return $this->showStart();
  }
  if (isset($query['parent_entity']) && isset($query['parent_id'])){
    $parent_entity = $query['parent_entity'];
    $parent_id = $query['parent_id'];
    $conditions = array($entity . '_' . strtolower($parent_entity) . '_id' => $parent_id);
    //print_r($conditions);
    $edit_addition = 'parent_entity='.$parent_entity.'&parent_id='.$parent_id;
    $return_addition = '&entity='. $entity . '&' . $edit_addition;
  }
  else {
    //print_r("parent entity and id not set");
    $return_addition = "";
    $conditions = array();
  }
  $destination='add_item';
  if (isset($_REQUEST["submitted"])) {
    $this->error = "<pre>submitted</pre>";
    /* create the information from the form into the database
     * return editItem screen with the new object on success
     * or blank addItem screen with message on failure
     * plus the message '(entity) created successfully'
     * (entity)_column_1=xyz
     */
    $insert_values = array();
    $entity_prefix = $entity . '_';
     foreach($_REQUEST as $key=>$value){
      $hyphen = strpos($key, $entity_prefix);
      if ($hyphen !== false) {
	$column = substr($key, $hyphen + strlen($entity_prefix));
	$insert_values[$column] = $value;
      }
     }
     $insert_values = array_merge($insert_values, $conditions);
     //print_r($insert_values);
    $id = $this->addThing($entity, $insert_values);
    //print_r($id);
    if (! is_numeric($id)) {
      $this->error .="<pre>There was a problem with addThing</pre>";
    }
    else {
      if ((int)$id > 0){
	$_REQUEST['id'] = $id;
      }
      else {
	$_REQUEST['id'] = $insert_values;
      }
      $_REQUEST['mode'] = 'update_item';
      return $this->updateItem();
    }
  }
    $returnurl = $this->action . '?mode=' . $entity .'_admin' . $return_addition;
    $action = $this->action . '?mode=' . $destination;
    $properties = $this->getPropertyList($entity);
    foreach($properties as $property) {
      if (is_array($property)){
	$subtype1 = array_keys($property);
	$subtype = $subtype1[0];
	$working_array = $property[$subtype];
	foreach($working_array as $subthing) {
	  $subthing->id = reset($subthing);
	  $subthing->description = next($subthing);
	}
      }
    }
    /* screen output*/
    $t = 'admin-add.html';
    $t = $this->twig->loadTemplate($t);
    $output = $t->render(array(
			       'modes' => $this->user_visible_modes,
			       'error' => $this->error,
			       'entity' => $entity,
			       'properties' => $properties,
			       'returnurl' => $returnurl,
			       'action' => $action,
			       'parent_entity' => $parent_entity,
			       'parent_id' => $parent_id
			       ));
    return $output;
  }
/* an extremely lightweight and fragile pluralise function,
 * suitable only for entity names at this stage
 * $singular is the thing to pluralise
 */
private function pluralise($singular) {

  $last_letter = strtolower($singular[strlen($singular)-1]);
  switch($last_letter) {
  case 'y':
    return substr($singular,0,-1).'ies';
  case 's':
    return $singular.'es';
  default:
    return $singular.'s';
  }

}
/* Takes an entity name and returns a list of properties for that database
 * calls describe :entity;
 * adds field name to array: 
 * if primary key (Key = 'PRI'), changes name to id
 * if foreign key, adds a new property list to the array, 
 * entity based on the field name
 * returns the array
 * which will have the following example structure:
 * id, field1, field2, (field3 => (id, field1a, field2a))
 */
private function getPropertyList($entity) {
  $property_list = array();
  $item_fields = array();

  try {
  $item_fields = $this->getListFromDB('information_schema.columns', array('table_name' => $entity ), null);
  /*$statement = "select column_name, column_key from information_schema.columns where table_name = ':entity'"; */
  /* find fields */
  /* Key = column_key; Field = column_name in DESCRIBE entity equivalent*/
    foreach ($item_fields as $field) {
      if ($field->COLUMN_KEY == 'PRI') {
	$property_list[] = 'id';
      }
      else if ($field->COLUMN_KEY == 'MUL') {
	$id_field = $field->COLUMN_NAME;
	$subentity = str_replace('_id', '', $id_field);
	/* get all subentities */

	$subentity_list = $this->getListFromDB($subentity);
	$property_list[] = array($subentity => $subentity_list);
      }
      else {
	$property_list[] = $field->COLUMN_NAME;
      }
    }
  }
  catch(Exception $e){
    return $this->handle_errors($e);
    /*$this->error = '<pre>ERROR: ' . $e->getMessage() . '</pre>';*/
  }

  return $property_list;
}

/* a generic function to edit entity details
 * gets all fields from the specified Entity
 * filled in with values if a id number specified ie EDIT)
 * when submitted, updates the Entity
 */
function updateItem() {
  //print_r($query);*/
  //print_r($_REQUEST);
  if (isset($_REQUEST['entity'])) {
    $entity = strtolower($_REQUEST['entity']);
  }
  else {
    return $this->showStart();
  }
  if (isset($_REQUEST['id'])) {
    $id = $_REQUEST['id'];
    /* if submitted, update the details
     * get entity details by id 
     * print the details
     */
    if (isset($_REQUEST["submitted"])) {
      $this->error .= "<pre>submitted</pre>";
      /*
       * (entity)_column_1=xyz
       */
      $insert_values = array();
      $remove_entity = $entity . '_';
      foreach($_REQUEST as $key=>$value){
	$hyphen = strpos($key, $remove_entity);
	if ($hyphen !== false) {
	  $column = substr($key, $hyphen + strlen($remove_entity));
	  $insert_values[$column] = $value;
	}
      }
      $id = $this->updateThing($entity, $id, $insert_values);
      //$_REQUEST['parent_id'] = $parent_id;
      //$_REQUEST['parent_entity'] = $parent_entity;
    }
    if (!is_array($id)) {
      $id_array = array($entity . '_id' => $id);
    }
    else {
      $id_array = $id;
    }
    $itemlist = $this->getListFromDB($entity, $id_array);
    $item_vars = array();
    if (isset($itemlist) and count($itemlist) > 0) {
      $item = $itemlist[0];
      $item_props = get_object_vars($item);
      $item_vars = array_values($item_props);
    }


    
  }
  
  else {
    $_REQUEST['entity'] = $entity;
    return $this->modifyTemplate();
  }
  $destination='update_item';
  $special = new StdClass();
  $special->active = false;
  /* would be nice to have a more generic solution here*/
  if (strtolower($entity) == 'category') {
    $special->active = true;
    $special->entity = 'template_price';
    $special->destination = 'template_admin';
    $special->action = $this->action . '?mode=' . $special->destination . '&entity=' . $special->entity . '&parent_entity=' . $entity . '&parent_id='. $id;
    }
  $returnurl = $this->action . '?mode=' . $entity .'_admin';
  if (isset($_REQUEST['parent_entity']) && isset($_REQUEST['parent_id'])){
    $parent_entity = $_REQUEST['parent_entity'];
    $parent_id = $_REQUEST['parent_id'];
    $conditions = array(strtolower($parent_entity) . '_id' => $parent_id);
    $returnurl .= '&entity='. $entity .'&parent_entity='.$parent_entity.'&parent_id='.$parent_id;
    
}
//&id='. $id;
$add_id = http_build_query(array('id' => $id));
			   $action = $this->action . '?mode=' . $destination . '&entity=' . $entity .'&'. $add_id;
  $properties = $this->getPropertyList($entity);
  foreach($properties as $property) {
    if (is_array($property)){
      $subtype1 = array_keys($property);
      $subtype = $subtype1[0];
      $working_array = $property[$subtype];
      foreach($working_array as $subthing) {
	$subthing->id = reset($subthing);
	$subthing->description = next($subthing);
      }
    }
      
  }
  

  /* screen output*/
  $t = 'admin-update.html';
  $t = $this->twig->loadTemplate($t);
  $output = $t->render(array(
			     'modes' => $this->user_visible_modes,
			     'error' => $this->error,
			     'entity' => $entity,
			     'properties' => $properties,
			     'returnurl' => $returnurl,
			     'action' => $action,
			     'item' => $item_vars,
			     'special' => $special,
			     'parent_entity' => $parent_entity,
			     'parent_id' => $parent_id
			     ));
  return $output; 
}

}

?>
