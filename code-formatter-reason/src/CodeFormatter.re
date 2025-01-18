/* CodeFormatter.re */

type language =
  | JavaScript
  | Python
  | JSON
  | HTML
  | CSS
  | SQL;

type formattingOptions = {
  indentSize: int,
  useTabs: bool,
  maxLineLength: int,
  insertSpaces: bool,
  trimTrailingWhitespace: bool,
};

let defaultOptions = {
  indentSize: 2,
  useTabs: false,
  maxLineLength: 80,
  insertSpaces: true,
  trimTrailingWhitespace: true,
};

let createIndent = (level, options) => {
  let level = max(0, level);
  let indentStr = String.make(level * options.indentSize, ' ');
  
  if (options.useTabs) {
    String.make(level, '\t');
  } else {
    indentStr;
  };
};

let trimTrailingWhitespace = line => {
  let rec trim = str =>
    switch (String.length(str)) {
    | 0 => str
    | len => {
        let lastChar = String.get(str, len - 1);
        switch (lastChar) {
        | ' ' | '\t' | '\r' | '\n' =>
          trim(String.sub(str, 0, len - 1))
        | _ => str
        };
      }
    };
  trim(line);
};

let formatJavaScript = (code, options) => {
  let lines = Js.String.split("\n", code);
  let currentIndent = ref(0);
  let result = ref("");
  
  /* Split line by braces to handle inline blocks */
  let splitByBraces = line => {
    let parts = ref([]);
    let current = ref("");
    
    for (i in 0 to String.length(line) - 1) {
      let c = String.get(line, i);
      switch (c) {
      | '{' | '}' => {
          if (String.length(current^) > 0) {
            parts := [current^, ...parts^];
          };
          parts := [String.make(1, c), ...parts^];
          current := "";
        }
      | c => current := current^ ++ String.make(1, c)
      };
    };
    if (String.length(current^) > 0) {
      parts := [current^, ...parts^];
    };
    List.rev(parts^);
  };

  /* Process each line */
  Array.iter(line => {
    let trimmed = Js.String.trim(line);
    if (String.length(trimmed) > 0) {
      let parts = splitByBraces(trimmed);
      
      List.iter(part => {
        let trimmedPart = Js.String.trim(part);
        switch (trimmedPart) {
        | "}" => {
            currentIndent := max(0, currentIndent^ - 1);
            result := result^ ++ "\n" ++ createIndent(currentIndent^, options) ++ "}";
          }
        | "{" => {
            result := result^ ++ " {" ++ "\n";
            currentIndent := currentIndent^ + 1;
          }
        | "" => ()
        | part => {
            if (!Js.String.includes("}", part) && !Js.String.includes("{", part)) {
              result := result^ ++ "\n" ++ createIndent(currentIndent^, options) ++ part;
            };
          }
        };
      }, parts);
    };
  }, lines);

  /* Clean up the result */
  let formatted = 
    result^
    |> Js.String.replaceByRe([%re "/\\n\\s*\\n/g"], "\n") /* Remove empty lines */
    |> Js.String.replaceByRe([%re "/^\\s*\\n/"], "")      /* Remove leading empty line */
    |> Js.String.trim;
    
  formatted;
};

let formatPython = (code, options) => {
  let lines = Js.String.split("\n", code);
  let currentIndent = ref(0);
  
  let processLine = line => {
    let trimmed = Js.String.trim(line);
    let indent = createIndent(currentIndent^, options);
    let formatted = indent ++ trimmed;
    
    if (Js.String.includes(":", trimmed)) {
      currentIndent := currentIndent^ + 1;
    } else if (trimmed == "") {
      currentIndent := max(0, currentIndent^ - 1);
    };
    
    formatted;
  };
  
  let formattedLines =
    Array.map(
      line =>
        options.trimTrailingWhitespace
          ? trimTrailingWhitespace(processLine(line))
          : processLine(line),
      lines,
    );
  
  Js.Array.joinWith("\n", formattedLines);
};

let formatJSON = (code, options) => {
  let processJSON = (input, level) => {
    let chars = Js.String.split("", input);
    let output = ref("");
    let i = ref(0);
    let len = Array.length(chars);
    let currentIndent = ref(level);
    
    while (i^ < len) {
      let c = Array.get(chars, i^);
      switch (c) {
      | "{" | "[" => {
          output := output^ ++ (if (i^ === 0) { "" } else { "\n" ++ createIndent(currentIndent^, options) }) ++ c;
          currentIndent := currentIndent^ + 1;
          output := output^ ++ "\n" ++ createIndent(currentIndent^, options);
          i := i^ + 1;
        }
      | "}" | "]" => {
          currentIndent := max(0, currentIndent^ - 1);
          output := output^ ++ "\n" ++ createIndent(currentIndent^, options) ++ c;
          i := i^ + 1;
        }
      | "," => {
          output := output^ ++ c ++ "\n" ++ createIndent(currentIndent^, options);
          i := i^ + 1;
        }
      | " " | "\n" | "\t" | "\r" => i := i^ + 1
      | c => {
          output := output^ ++ c;
          i := i^ + 1;
        }
      };
    };
    
    output^;
  };
  
  processJSON(code, 0);
};

let formatCode = (code, language, ~options=defaultOptions, ()) => {
  switch (language) {
  | JavaScript => formatJavaScript(code, options)
  | Python => formatPython(code, options)
  | JSON => formatJSON(code, options)
  | HTML => "HTML formatting not implemented yet"
  | CSS => "CSS formatting not implemented yet"
  | SQL => "SQL formatting not implemented yet"
  };
};

let testJs = "function example() {if(true){console.log(\"Hello\");}}";
let testPy = "def example():\nif True:\nprint(\"Hello\")\nreturn None";
let testJson = "{\"name\":\"John\",\"age\":30,\"city\":\"New York\"}";

Js.log("JavaScript Example:");
Js.log(formatCode(testJs, JavaScript, ()));

Js.log("\nPython Example:");
Js.log(formatCode(testPy, Python, ()));

Js.log("\nJSON Example:");
Js.log(formatCode(testJson, JSON, ()));