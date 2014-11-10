<?php

/*
 * Original Author : Thomas Rabaix 
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

 class NTLMStream {

	private $path;
	private $mode;
	private $options;
	private $opened_path;
	private $pos;

	protected $buffer;
	protected $ch;
	protected static $username;
	protected static $password;

	public static function setCredentials($username, $password) {
		self::$username = $username;
		self::$password = $password;
	}

	public function stream_open($path, $mode, $options, $opened_path) {

		$this->path = $path;
		$this->mode = $mode;
		$this->options = $options;
		$this->opened_path = $opened_path;
		$this->createBuffer($path);

		return true;
	}

	public function stream_close() {

		curl_close($this->ch);
	}

	public function stream_read($count) {

		if(strlen($this->buffer) == 0)
			return false;

		$read = substr($this->buffer, $this->pos, $count);
		$this->pos += $count;

		return $read;
	}

	public function stream_write($data) {

		if(strlen($this->buffer) == 0)
			return false;

		return true;
	}

	public function stream_eof() {

		return $this->pos > strlen($this->buffer);
	}

	public function stream_tell() {

		return $this->pos;
	}

	public function stream_flush() {

		$this->buffer = null;
		$this->pos = null;
	}

	public function stream_stat() {

		return $this->url_stat($this->path, 0);
	}

	public function url_stat($path, $flags) {

		$this->createBuffer($path);

		$stat = array("size" => strlen($this->buffer));

		return $stat;
	}

	protected function createBuffer($path) {

		if ($this->buffer)
			return;

		$this->ch = curl_init($path);

		curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($this->ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
		curl_setopt($this->ch, CURLOPT_SSL_VERIFYHOST, false); // Don't check certificate
		curl_setopt($this->ch, CURLOPT_SSL_VERIFYPEER, false); // Ditto
		curl_setopt($this->ch, CURLOPT_HTTPAUTH, CURLAUTH_NTLM | CURLAUTH_BASIC);
		curl_setopt($this->ch, CURLOPT_USERPWD, self::$username.':'.self::$password);

		$this->buffer = curl_exec($this->ch);
		$this->pos = 0;
	}
}
 
 class ExchangeNTLMStream extends NTLMStream {

	protected function createBuffer($path) {
 
		parent::createBuffer($path);

		if (strpos($path, "Services.wsdl") === false)
		  return false;

		$xml = simplexml_load_string($this->buffer);

		if (!$xml instanceof SimpleXMLElement)
		  return false;

		$service = $xml->addChild('wsdl:service');
		$service->addAttribute('name', 'ExchangeServices');

		$port = $service->addChild('wsdl:port');
		$port->addAttribute('name', 'ExchangeServicePort');
		$port->addAttribute('binding', 'tns:ExchangeServiceBinding');

		$address = $port->addChild('soap:address', null, 'soap');
		$address->addAttribute('location', str_replace('Services.wsdl', 'Exchange.asmx', $path));

		$this->buffer = str_replace('xmlns:soap="soap" ', '', $xml->asXML());
		return true;
	}
}
 
class NTLMSoapClient extends SoapClient {

	private $username;
	private $password;

	public function __construct($wsdl, $options = array()) {
	
		parent::__construct($wsdl, $options);

		if (array_key_exists('login', $options))
			$this->username = $options['login'];

		if (array_key_exists('password', $options))
			$this->password = $options['password'];
	}
	
	public function __doRequest($request, $location, $action, $version, $one_way = 0) {

		$headers = array(
			"Method: POST",
			"Connection: Keep-Alive",
			"User-Agent: PHP-SOAP-CURL",
			"Content-Type: text/xml; charset=utf-8",
			"SOAPAction: '$action'",
		);  
    
		$this->__last_request_headers = $headers;
    
		$ch = curl_init($location);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
		curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_NTLM | CURLAUTH_BASIC);
		curl_setopt($ch, CURLOPT_USERPWD, $this->username . ':' . $this->password);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

		return curl_exec($ch);
	}   

	public function __getLastRequestHeaders() {

		return implode("n", $this->__last_request_headers) . "n";
	}
}

class ExchangeClient {  

	private $wsdl;
	private $client;
	private $username;
	private $password;
	private $delegate;

	public $last_error;

	public function __construct($wsdl, $username, $password, $delegate = NULL) {

		$this->wsdl = $wsdl;
		$this->username = $username;
		$this->password = $password;
		$this->delegate = $delegate;

		$this->registerStreams();

		$this->client = new NTLMSoapClient($this->wsdl, array(
			'trace' => 1,
			'exceptions' => true,
			'login' => $username,
			'password' => $password
		));

 		$this->unregisterStreams();
	}

	public function sendEmail($to, $subject, $content, $bodytype = "Text", $save_copy_in = "sentitems", $mark_as_read = true) {

		$this->registerStreams();

		$message_request = new stdClass();

		if (!empty($save_copy_in)) {

			$message_request->MessageDisposition = "SendAndSaveCopy";
			$message_request->SavedItemFolderId->DistinguishedFolderId->Id = $save_copy_in;
		}

		else
			$message_request->MessageDisposition = "SendOnly";
		
		$message_request->Items->Message->ItemClass = "IPM.Note";
		$message_request->Items->Message->Subject = $subject;
		$message_request->Items->Message->Body->BodyType = $bodytype;
		$message_request->Items->Message->Body->_ = $content;
		$message_request->Items->Message->ToRecipients->Mailbox->EmailAddress = $to;
		
		if ($mark_as_read)
			$message_request->Items->Message->IsRead = "true";
			
		if ($this->delegate != NULL)
			$message_request->Items->Message->From->Mailbox->EmailAddress = $this->delegate;
		
		$response = $this->client->CreateItem($message_request);
		
		$this->unregisterStreams();
		
		if ($response->ResponseMessages->CreateItemResponseMessage->ResponseCode == "NoError")
			return true;

		else {

			$this->last_error = $response->ResponseMessages->CreateItemResponseMessage->ResponseCode;
			return false;
		}
	}

	private function registerStreams() {

		ExchangeNTLMStream::setCredentials($this->username, $this->password);
			
		stream_wrapper_unregister('http');
		stream_wrapper_unregister('https');

		if(!stream_wrapper_register('http', 'ExchangeNTLMStream')) {
			throw new Exception("Failed to register protocol");
		}

		if(!stream_wrapper_register('https', 'ExchangeNTLMStream')) {
			throw new Exception("Failed to register protocol");
		}
	}
	
	private function unregisterStreams() {

		stream_wrapper_restore('http');
		stream_wrapper_restore('https');
	}
}