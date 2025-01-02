{-# LANGUAGE OverloadedStrings #-}

import Database.SQLite.Simple
import Database.SQLite.Simple.FromRow()  -- Only import instances
import Database.SQLite.Simple.ToRow()    -- Only import instances
import System.IO
import Control.Monad

data TodoItem = TodoItem { 
    todoId :: Int,
    description :: String,
    completed :: Bool
} deriving (Show)

instance FromRow TodoItem where
    fromRow = TodoItem <$> field <*> field <*> field

instance ToRow TodoItem where
    toRow (TodoItem tid desc comp) = toRow (tid, desc, comp)

setupDatabase :: Connection -> IO ()
setupDatabase conn = execute_ conn "CREATE TABLE IF NOT EXISTS todos (\
    \id INTEGER PRIMARY KEY, \
    \description TEXT NOT NULL, \
    \completed BOOLEAN NOT NULL DEFAULT 0)"

main :: IO ()
main = do
    putStrLn "Welcome to Haskell Todo List with SQLite!"
    conn <- open "todos.db"
    setupDatabase conn
    todoLoop conn
    close conn

todoLoop :: Connection -> IO ()
todoLoop conn = do
    putStrLn "\nCommands:"
    putStrLn "1. Add todo"
    putStrLn "2. List todos"
    putStrLn "3. Complete todo"
    putStrLn "4. Delete todo"
    putStrLn "5. Exit"
    putStr "Enter command: "
    hFlush stdout
    cmd <- getLine
    case cmd of
        "1" -> addTodo conn
        "2" -> listTodos conn
        "3" -> completeTodo conn
        "4" -> deleteTodo conn
        "5" -> putStrLn "Goodbye!"
        _ -> do
            putStrLn "Invalid command!"
            todoLoop conn

addTodo :: Connection -> IO ()
addTodo conn = do
    putStr "Enter todo description: "
    hFlush stdout
    desc <- getLine
    execute conn "INSERT INTO todos (description, completed) VALUES (?, ?)" 
           (desc, False :: Bool)
    rowId <- lastInsertRowId conn
    putStrLn $ "Added todo #" ++ show rowId
    todoLoop conn

listTodos :: Connection -> IO ()
listTodos conn = do
    todos <- query_ conn "SELECT id, description, completed FROM todos ORDER BY id" :: IO [TodoItem]
    if null todos
        then putStrLn "No todos!"
        else do
            putStrLn "\nYour todos:"
            forM_ todos $ \todo -> do
                putStr $ show (todoId todo) ++ ". "
                putStr $ if completed todo then "[✓] " else "[ ] "
                putStrLn $ description todo
    todoLoop conn

completeTodo :: Connection -> IO ()
completeTodo conn = do
    putStr "Enter todo ID to complete: "
    hFlush stdout
    tid <- readLn :: IO Int
    execute conn "UPDATE todos SET completed = 1 WHERE id = ?" (Only tid)
    rowsChanged <- changes conn
    if rowsChanged > 0
        then putStrLn $ "Completed todo #" ++ show tid
        else putStrLn "Todo not found!"
    todoLoop conn

deleteTodo :: Connection -> IO ()
deleteTodo conn = do
    putStr "Enter todo ID to delete: "
    hFlush stdout
    tid <- readLn :: IO Int
    execute conn "DELETE FROM todos WHERE id = ?" (Only tid)
    rowsChanged <- changes conn
    if rowsChanged > 0
        then putStrLn $ "Deleted todo #" ++ show tid
        else putStrLn "Todo not found!"
    todoLoop conn