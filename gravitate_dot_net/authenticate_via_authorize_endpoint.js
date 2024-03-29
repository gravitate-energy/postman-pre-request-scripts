

var sdk = require('postman-collection');
var authServiceUrl = FillFromEnvironmentOrCollection('{{baseUrl}}/api/Authorize/Authenticate');
console.log(`Auth Service URL: ${authServiceUrl}`) 

var alwaysRefresh = GetFromEnvironmentOrCollection('alwaysRefresh');
if(alwaysRefresh == 'true'){
    RefreshToken();
}else {
    ValidateAndRefreshToken();
} 

function RefreshToken() {
    var username = GetFromEnvironmentOrCollection('username');
    var password = GetFromEnvironmentOrCollection('password');
    var url = `${authServiceUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    var tokenRequest = new sdk.Request({
    url: url,
    method: 'POST',
    header: [
        new sdk.Header({
            key: 'content-type',
            value: 'application/json'
        }),
        new sdk.Header({
            key: 'acccept',
            value: 'application/json'
        }),
    ],
  });

  pm.sendRequest(tokenRequest, function (err, response) {
      if (err) {
          console.log(`Error in request ${tokenRequest}`)
          throw err;
      }
      

      var payload = response.json();

      if(response.code == 200 && payload.Token){
        var token = response.json().Token.replace("Bearer","").trim()
        pm.collectionVariables.set("jwttoken", token);
        console.log(`New token has been set: ${token}`);
      }
      else {
          throw new Error(`Could not log in, details below: ${JSON.stringify(payload, 0, 2)}`);
      }
  }); 
}

function ValidateAndRefreshToken(){
    console.log(validationService)
    var validationService = FillFromEnvironmentOrCollection('{{baseUrl}}/api/Authorize/ValidateAuthorization');
    console.log(validationService)
    var isValidTokenRequest = new sdk.Request({
        url: validationService, // Use an endpoint that requires being authenticated
        method: 'POST',
        header: [
            new sdk.Header({
                key: 'content-type',
                value: 'application/json',
            }),
            new sdk.Header({
                key: 'acccept',
                value: 'application/json',
            }),
            new sdk.Header({
                key: 'Authorization',
                value: 'Bearer ' + pm.collectionVariables.get("jwttoken"),
            }),
        ]
    });

    pm.sendRequest(isValidTokenRequest, function (err, response) {
        if (response.code === 401) {
            RefreshToken();
        }
    });
}

// Gets a variable value from the environment or collection
function GetFromEnvironmentOrCollection(variableName, required){

    var environment = pm.environment.get(variableName)
    var collection = pm.collectionVariables.get(variableName)
    
    var useEnvironment = environment != undefined && environment != null
    var collectionValid = collection != undefined || collection != null

    var result = undefined;
    if(useEnvironment) {
        result = environment;
        console.log(`Pulled ${variableName} from environment, value ${result}`)
    }else if(collectionValid){
        result = collection;
        console.log(`Pulled ${variableName} from collectionVariables, value ${result}`)
    }else if (required !== false) {
        throw `Could not find a value for ${variableName} in environment or collectionVariables`
    }

    return result;
}

// given a string sourced from a variable, attempt to fill in any {{var}} values from the environment or collection variables
function FillVariableFromEnvironmentOrCollection(paramName){
    var replace = GetFromEnvironmentOrCollection(paramName)
    return FillFromEnvironmentOrCollection(replace);
}

// given a string, attempt to fill in any {{var}} values from the environment or collection variables
function FillFromEnvironmentOrCollection(inputString){
    var result = pm.environment.replaceIn(inputString); // attempts to fill any {{var}} values from the environment
    result = pm.collectionVariables.replaceIn(result); // attempts to fill any {{var}} values from the collection variables
    return result;
}
