window.onload = function() {
  console.log("Started");
  var b = document.getElementById("b");
  var t = document.getElementById("t");
  var n = document.getElementById("n");
  
  console.log(getQueryVariable("code") +":"+ getQueryVariable("input"));
  
  t.textContent = getQueryVariable("code");
  n.textContent = getQueryVariable("input");
};

function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return("");
}

var f = function() {
  var t = document.getElementById("t");
  var p = document.getElementById("p");
  var n = document.getElementById("n");
  p.innerText = Main(t.value, n.value + "");
  console.log(Main(t.value, n.value + ""));
}

//code for prime number checker taken from https://github.com/vihanb/TeaScript/blob/master/teascript.js
var checkForPrime = function(number) {
  var start = 2;
  while (start <= Math.sqrt(number)) {
    if (number % start++ < 1) return false;
  }
  return number > 1;
}

var evaluate = function(match) {
  return eval(match);
}

var Main = function(_input, _args) {
  var stack = "";
  var typeMode = "string";
  if (_input.indexOf("^") == -1) {
    var stack = _input + "";
    var args = _args;
    if (stack.indexOf("#") != -1) {
      stack = stack.replace(/#/g, args);
    }
    if (stack.indexOf("$") != -1) {
      stack = stack.replace(/\$/g, parseInt(args));
    }
    stack = stack.replace(/\(([^\(\)]*)\)/g, evaluate);//eval parenthesis
  } else {
    //Variables
    var input = _input.split(/\^/);
    var args = _args;
    var stack = input[0] + "";
    var ops = input[1];
    var stackVar = stack; //TODO
    var stackInt = 0;
    var stackIntVar = stackInt; //TODO
    var stackBool = true;
    var stackBoolVar = stackBool;
    var isInt = false;
    var typeMode = "string";

    //Carrot variables: # and *
    if (ops.indexOf("#") != -1) {
      ops = ops.replace(/#/g, "\"" + args + "\"");
    }
    if (ops.indexOf("$") != -1) {
      ops = ops.replace(/\$/g, parseInt(args));
    }
    if (stack.indexOf("#") != -1) {
      stack = stack.replace(/#/g, args);
    }
    if (stack.indexOf("$") != -1) {
      stack = stack.replace(/\$/g, parseInt(args));
    }

    ops = ops.replace(/\(([^\(\)]*)\)/g, evaluate);//eval parenthesis

    ops=ops.replace(/(1|true)\?([^\:]*)\:([^\|]*)\|/g, "$2");//if statements
    ops=ops.replace(/(0|false)\?([^\:]*)\:([^\|]*)\|/g, "$3");//else statements

    //checking if caret is missing
    try {
      console.log(ops.length);
    } catch (e) {
      //alert("No code");
    }

    //Iterating through the operators.
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      //ops=ops.replace(/\[(\d+)[^\]]*\]/, function($0, $1){return $0.replace(/@/g, $1);});
      try {
        var nextChar = ops[i + 1];
      } catch (e) {
        nextChar = 0;
      }
      //console.log(nextChar);
      switch (op) {
        case "["://repeat statement
          var numRe = /\[(\d+)/;
          var numLoops = numRe.exec(ops.substring(i, ops.length));
          var loops = parseInt(numLoops[1]);
          var commandsRe = /\[\d+([^\]]*)\]/;
          var commandsTested = commandsRe.exec(ops.substring(i, ops.length));
          var commands = commandsTested[1];
          console.log(commands+"");
          for(var j = 1; j <= loops; j++) {
            stack = Main(stack+"^"+commands.replace(/@/g, j+""), _args);
          }
          i=i+numLoops[1].length+commands.length + 1;
          break;
        case "i":
          //Convert to integer
          stackInt = parseInt(stack);
          stackIntVar = stackInt;
          typeMode = "int";
          break;
        case "P":
          if (stackInt !== 0) {
            stackBool = checkForPrime(stackInt);
          } else {
            stackBool = checkForPrime(parseInt(stack));
          }
          typeMode = "bool";
          break;
        case "/":
          //Divide '/'
          switch (nextChar) {
            case "\"":
              break
            case "\'":
              break;
            default:
              //number
              var num = 0;
              var matched = false;
              var numRe = /\d+/;
              var match = numRe.exec(ops.substring(i, ops.length));
              num = parseInt(match);
              stackInt /= num;
              if(stack.length > num) {
                stack = stack.slice(0,num) + stack.slice(num+1);
              }
          }
          break;
        case "*":
          //Multiply '*'
          switch (nextChar) {
            case "\"":
              break
            case "\'":
              break;
            default:
              //number
              var num = 0;
              var matched = false;
              var numRe = /\d+/;
              var match = numRe.exec(ops.substring(i, ops.length));
              num = parseInt(match);
              stackInt *= num;
              for (var j = 0; j++ < num;) {
                stack += stackVar;
              }
          }
          break;
        case "-":
          //Subtract '-'
          switch (nextChar) {
            case "\"":
              break
            case "\'":
              break;
            default:
              //number
              var num = 0;
              var matched = false;
              var numRe = /\d+/;
              var match = numRe.exec(ops.substring(i, ops.length));
              num = parseInt(match);
              stackInt -= num;
              stack = stack.substring(0, stack.length - num);
          }
          break;
        case "+":
          //Add '+'
          if (!(nextChar == "\"")) {
            //number
            var num = 0;
            //TODO
            if(ops[i+1] === "@") {
              var re = /\[(\d+)/;
              num = parseInt(re.exec(ops)[1]);  
            }else{
            var matched = false;
            var numRe = /\d+/;
            var match = numRe.exec(ops.substring(i, ops.length));
            i = i + match.length;
            num = parseInt(match);
            }
            stackInt += num;
            stack += num;
          } else {
            //string
            var string = "";
            var matched = false;
            var stringRe = /\"([^\"]*)\"/;
            var match = stringRe.exec(ops.substring(i + 1, ops.length));
            string = match[1]; //getting the captured group
            i = i + 2 + string.length;
            if (typeMode == "int") {
              //converting to string
              typeMode = "string";
              stack = stackInt + string;
            } else if (typeMode == "string") {
              stack += string;
            }
          }

          break;
      }
    }
  }

  switch (typeMode) {
    case "string":
      return stack;
      break;
    case "int":
      return stackInt;
      break;
    case "bool":
      return stackBool;
      break;
  }
}
