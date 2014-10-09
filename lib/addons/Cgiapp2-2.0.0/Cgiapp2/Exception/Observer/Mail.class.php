<?php
/**
 * Cgiapp2 - Framework for building reusable web-applications
 *
 * A PHP5 port of perl's CGI::Application, a framework for building reusable web
 * applications. 
 *
 * @package Cgiapp2
 * @author Matthew Weier O'Phinney <mweierophinney@gmail.com>; based on
 * CGI::Application, by Jesse Erlbaum <jesse@erlbaum.net>, et. al.
 * @copyright (c) 2004 - present, Matthew Weier O'Phinney
 * @license BSD License (http://www.opensource.org/licenses/bsd-license.php)
 * @category Tools and Utilities
 * @tutorial Cgiapp2/Cgiapp2.cls
 * @version $Id:$
 */

/**
 * Observes Cgiapp2_Exception
 */
require_once 'Cgiapp2/Exception.class.php';

/**
 * Implements Cgiapp2_Exception_Observer_Interface
 */
require_once 'Cgiapp2/Exception/Observer/Interface.class.php';

/**
 * Cgiapp2_Exception_Observer_Mail
 *
 * {@link Cgiapp2_Exception} observer. Mails exception information to a user.
 *
 * Sample usage:
 * <code>
 * require_once 'Cgiapp2/Exception/Observer/Mail.class.php';
 *
 * // Set the mail recipient to 'mweierophinney@gmail.com'
 * Cgiapp2_Exception_Observer_Mail:setRecipient('mweierophinney@gmail.com');
 *
 * // Set the mail subject to 'Exception in application code'
 * Cgiapp2_Exception_Observer_Mail:setSubject('Exception in application code');
 *
 * try {
 *     throw new Cgiapp2_Exception('Mail this...');
 * } catch (Cgiapp2_Exception $e) {
 *     // do something
 * }
 * </code>
 * 
 * @package Cgiapp2
 * @author Matthew Weier O'Phinney <mweierophinney@gmail.com> 
 * @copyright (c) 2006 - Present, Matthew Weier O'Phinney
 * <mweierophinney@gmail.com>
 * @version @release-version@
 */
class Cgiapp2_Exception_Observer_Mail implements Cgiapp2_Exception_Observer_Interface
{
    /**
     * Email recipient
     * @var string
     * @access public
     */
    public $to;

    /**
     * Email subject
     * @var string
     * @access public
     */
    public $subject;

    /**
     * Singleton instance
     * @var bool|Cgiapp2_Exception_Observer_Mail
     * @static
     * @access private
     */
    private static $instance = false;

    /**
     * Constructor
     *
     * @param mixed $to 
     * @param mixed $subject 
     * @access private
     * @return void
     */
    private function __construct($subject, $to = null)
    {
        $this->to      = $to;
        $this->subject = $subject;
    }

    /**
     * Singleton
     *
     * Accepts recipient address and subject; uses sane default for subject
     * ('Exception occurred in application').
     * 
     * @static
     * @access public
     * @param string $to
     * @param string $subject
     * @return Cgiapp2_Exception_Observer_Mail
     */
    public static function getInstance($to = null, $subject = '')
    {
        if (self::$instance) {
            return self::$instance;
        }

        if (empty($subject)) {
            $subject = 'Exception in application occurred';
        }

        return new Cgiapp2_Exception_Observer_Mail($subject, $to);
    }

    /**
     * Set mail recipient
     * 
     * @static
     * @access public
     * @param string $to 
     * @return void
     */
    public static function setRecipient($to)
    {
        self::getInstance()->to = $to;
    }

    /**
     * Set mail subject
     * 
     * @static
     * @access public
     * @param string $subject 
     * @return void
     */
    public static function setSubject($subject)
    {
        self::getInstance()->subject = $subject;
    }

    /**
     * Mail a report
     *
     * If no {@link $to} address is defined in the singleton instance, nothing
     * is done. Otherwise, an email is sent with details of the exception.
     * 
     * @access public
     * @param Cgiapp2_Exception $e
     * @return void
     */
    public static function event(Cgiapp2_Exception $e)
    {
        $handler = self::getInstance();
        if (empty($handler->to)) {
            return;
        }

        $file  = $e->getFile();
        $line  = $e->getLine();
        $code  = $e->getCode();
        $msg   = $e->getMessage();
        $trace = $e->getTraceAsString();

        $body=<<<EOT
An error occurred in your application:

File: $file
Line: $line
Error Number: $code
Error Message:
$msg

Backtrace:
$trace
EOT;
        @mail($handler->to, $handler->subject, $body);
    }
}

/**
 * Observe Cgiapp2_Exception
 */
Cgiapp2_Exception::attach('Cgiapp2_Exception_Observer_Mail');
