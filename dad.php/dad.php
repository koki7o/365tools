<?php

namespace DadJokes;

class DadErrorHandler {
    private static $dadJokes = [
        'undefined_variable' => "What did the undefined variable say? I just haven't found myself yet!",
        'division_by_zero' => "Why don't you divide by zero? Because it's pointless!",
        'file_not_found' => "What did the missing file say? 404 gotten!",
        'type_error' => "Why did the type checker cross the road? To cast the other side!",
        'default' => "Why do programmers need glasses? Because they can't C#!"
    ];

    private static $errorTypeMappings = [
        E_ERROR             => 'default',
        E_NOTICE           => 'undefined_variable',
        E_WARNING          => 'file_not_found',
        E_PARSE            => 'type_error',
        'DivisionByZeroError' => 'division_by_zero'
    ];

    public static function enable() {
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
    }

    public static function handleError($errno, $errstr, $errfile, $errline) {
        $errorType = self::$errorTypeMappings[$errno] ?? 'default';
        $dadJoke = self::$dadJokes[$errorType];
        
        $message = sprintf(
            "\n🎭 Dad Joke Error Handler 🎭\n" .
            "Here's a dad joke while you fix this:\n%s\n\n" .
            "Original Error: %s\n" .
            "File: %s\n" .
            "Line: %d\n",
            $dadJoke,
            $errstr,
            $errfile,
            $errline
        );
        
        if (php_sapi_name() === 'cli') {
            fwrite(STDERR, $message);
        } else {
            echo "<pre style='background:#f8f9fa;padding:20px;border-radius:5px;'>";
            echo htmlspecialchars($message);
            echo "</pre>";
        }
        
        return true;
    }

    public static function handleException($exception) {
        $errorType = self::$errorTypeMappings[get_class($exception)] ?? 'default';
        $dadJoke = self::$dadJokes[$errorType];
        
        $message = sprintf(
            "\n🎭 Dad Joke Exception Handler 🎭\n" .
            "Here's a dad joke while you fix this:\n%s\n\n" .
            "Exception: %s\n" .
            "Message: %s\n" .
            "File: %s\n" .
            "Line: %d\n",
            $dadJoke,
            get_class($exception),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine()
        );
        
        if (php_sapi_name() === 'cli') {
            fwrite(STDERR, $message);
        } else {
            echo "<pre style='background:#f8f9fa;padding:20px;border-radius:5px;'>";
            echo htmlspecialchars($message);
            echo "</pre>";
        }
    }

    public static function addDadJoke($errorType, $joke) {
        self::$dadJokes[$errorType] = $joke;
    }
}