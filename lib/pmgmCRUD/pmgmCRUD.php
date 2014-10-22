<?php
/**
 * pmgmCRUD - a collection of generic database access functions
 *
 * PHP version 5.3
 *
 * @author     Patrick Maslen
 */
/* assumes a PDO database connection called $conn */
class PmgmDao {
  /* @var conn
   * PDO connection
   */
  private $conn;
  /* constructor: set the PDO connection */
  function PmgmDao($conn) {
    if(get_class($conn) == 'PDO') {
      $this->conn = $conn;
    }
  }
/* $table is the name of the table
 * $conditions is an array of context-specific WHERE clause conditions eg.
 * ('id' => 1, username = 'godzilla') or
 * ('id' => array(1,2,3,4)) for a WHERE...IN clause
 * $ordering a string or array of column names for ORDER BY...
 * returns an array of objects
 */
function getListFromDB($table, $conditions = null, $ordering = null) {
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
    echo($e->getMessage());
  }
  return $entity_list;
}
/* $conditions is an array (column=>value)
 * if value is an array it is made into an IN clause
 * if $conditions is an array of arrays
 * then each sub-array is evaluated **recursively** 
 * as an OR clause
 */
 function makeConstraintSQL($conditions) {
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
 function makeOrderingSQL($order_by) {
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
function getPropertyList($entity) {
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
    echo($e->getMessage());
  }

  return $property_list;
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
function is_assoc($array) {
  return (bool)count(array_filter(array_keys($array), 'is_string'));
}
/* adds a thing to the database
 * thing is an entity name, eg. template, department
 * thing_details is an array of (property_name => property_value)
 * for the thing
 * returns the id of the new thing
 */
 function addThing($thing, $thing_details) {
  $thing_id = -1;
  $statement = 'INSERT INTO :entity (xxx) VALUES (yyy)';
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
      echo($statement . ': ' . $e->getMessage());
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
 function updateThing($thing, $thing_id, $thing_details) {
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
      echo($statement . ': ' . $e->getMessage());
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
 function deleteThings($thing, $id) {

  $conditions = $id;
  $keytext = $this->makeConstraintSQL($conditions);
  $statement = "delete from $thing where " . $keytext;
  //print_r($statement);
  try {
    $stmt = $this->conn->prepare($statement);
    $stmt->execute();
  }
  catch (Exception $e) {
    echo($statement . ': ' . $e->getMessage());
  }
}
}
?>