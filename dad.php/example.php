<?php

require_once 'dad.php';
DadJokes\DadErrorHandler::enable();

// Add specific jokes for each error type
DadJokes\DadErrorHandler::addDadJoke('undefined_variable', 'What did the undefined variable say? I just haven\'t found myself yet!');
DadJokes\DadErrorHandler::addDadJoke('division_by_zero', 'Why don\'t you divide by zero? Because it\'s pointless!');
DadJokes\DadErrorHandler::addDadJoke('file_not_found', 'What did the missing file say? 404 gotten!');
DadJokes\DadErrorHandler::addDadJoke('type_error', 'Why did the type checker cross the road? To cast the other side!');

// Test cases in functions so they run independently
function test_undefined() {
    $result = $undefined_variable * 2;
}

function test_division() {
    try {
        $divide = 42 / 0;
    } catch (DivisionByZeroError $e) {
        throw $e;
    }
}

function test_file() {
    file_get_contents('nonexistent.txt');
}

function test_type() {
    $number = "not a number";
    sqrt($number);
}

// Run tests
echo "\nTesting undefined variable:\n";
test_undefined();

echo "\nTesting division by zero:\n";
test_division();

echo "\nTesting file not found:\n";
test_file();

echo "\nTesting type error:\n";
test_type();