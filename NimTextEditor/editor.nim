import os, strutils, terminal

type
  Editor = object
    filename: string
    buffer: seq[string]
    cursorX, cursorY: int
    modified: bool

proc initEditor(): Editor =
  result = Editor(
    filename: "",
    buffer: @[""],
    cursorX: 0,
    cursorY: 0,
    modified: false
  )

proc saveFile(editor: var Editor) =
  eraseScreen()
  showCursor()
  
  if editor.filename == "":
    echo "Enter filename to save: "
    editor.filename = stdin.readLine()
  
  try:
    writeFile(editor.filename, editor.buffer.join("\n"))
    editor.modified = false
    echo "File saved successfully!"
    sleep(1000) # Show message for a second
  except IOError:
    echo "Error saving file!"
    sleep(1000)
  
  hideCursor()

proc loadFile(editor: var Editor, filename: string) =
  try:
    editor.filename = filename
    editor.buffer = readFile(filename).splitLines()
    if editor.buffer.len == 0:
      editor.buffer = @[""]
  except IOError:
    editor.buffer = @[""]
    echo "New file"
    sleep(1000)

proc displayBuffer(editor: Editor) =
  eraseScreen()
  setCursorPos(0, 0)
  
  # Display the buffer
  for line in editor.buffer:
    stdout.write(line & "\n")
  
  # Display status line
  setCursorPos(0, terminalHeight() - 1)
  let status = if editor.modified: "[Modified]" else: ""
  stdout.write("File: ", editor.filename, " ", status, 
               " | Ctrl+S: Save | Ctrl+Q: Quit")
  
  # Set cursor position
  setCursorPos(editor.cursorX, editor.cursorY)
  stdout.flushFile()

proc handleInput(editor: var Editor, key: char) =
  case key
  of '\r', '\n': # Enter
    let currentLine = editor.buffer[editor.cursorY]
    let leftPart = currentLine[0 ..< editor.cursorX]
    let rightPart = if editor.cursorX < currentLine.len: currentLine[editor.cursorX .. ^1] else: ""
    editor.buffer[editor.cursorY] = leftPart
    editor.buffer.insert(rightPart, editor.cursorY + 1)
    editor.cursorY += 1
    editor.cursorX = 0
    editor.modified = true
  of '\b', '\x7f': # Backspace or Delete
    if editor.cursorX > 0:
      let currentLine = editor.buffer[editor.cursorY]
      editor.buffer[editor.cursorY] = currentLine[0 ..< editor.cursorX-1] & 
                                     currentLine[editor.cursorX .. ^1]
      editor.cursorX -= 1
      editor.modified = true
    elif editor.cursorY > 0:
      let currentLine = editor.buffer[editor.cursorY]
      editor.cursorX = editor.buffer[editor.cursorY - 1].len
      editor.buffer[editor.cursorY - 1] &= currentLine
      editor.buffer.delete(editor.cursorY)
      editor.cursorY -= 1
      editor.modified = true
  else: # Regular character
    if ord(key) >= 32 and ord(key) < 127: # Only printable characters
      let currentLine = editor.buffer[editor.cursorY]
      editor.buffer[editor.cursorY] = currentLine[0 ..< editor.cursorX] & 
                                     $key & 
                                     currentLine[editor.cursorX .. ^1]
      editor.cursorX += 1
      editor.modified = true

proc askToSave(): bool =
  eraseScreen()
  showCursor()
  echo "Save changes? (y/n): "
  let response = stdin.readLine()
  hideCursor()
  result = response.toLowerAscii().startsWith("y")

proc main() =
  var editor = initEditor()
  
  # Load file if provided as argument
  if paramCount() > 0:
    editor.loadFile(paramStr(1))
  
  hideCursor()
  
  while true:
    editor.displayBuffer()
    
    let key = getch()
    case key
    of '\x13': # Ctrl+S
      editor.saveFile()
    of '\x11': # Ctrl+Q
      if editor.modified:
        if askToSave():
          editor.saveFile()
      break
    else:
      editor.handleInput(key)
  
  # Cleanup
  showCursor()
  eraseScreen()

when isMainModule:
  main()