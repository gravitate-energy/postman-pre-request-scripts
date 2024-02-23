console.log(`Starting script...`);

var sdk = require('postman-collection');
var authServiceUrl = FillFromEnvironmentOrCollection('{{baseUrl}}/{{tokenRelativeUrl}}');
console.log(`authServiceUrl: ${authServiceUrl}`);

var formData = GetFromEnvironmentOrCollection('formData');

console.log(`formData: ${formData}`);

console.log(`Auth Service URL: ${authServiceUrl}`) 

RefreshToken();

function RefreshToken() {
    var url = `${authServiceUrl}`
    
    var formDataFilled = FillFromEnvironmentOrCollection(formData);

    console.log(`formDataFilled: ${formDataFilled}`);

    var tokenRequest = {
        url: url,
        method: 'POST',
        header: 'Content-Type:application/x-www-form-urlencoded',
        body: {
            mode: 'urlencoded',
            urlencoded: JSON.parse(formDataFilled)
            }
    };
    pm.sendRequest(tokenRequest, function (err, response) {
        
        if (err) {
            console.log(`Error in request ${tokenRequest}`)
            throw err;
        }
        var payload = response.json();

        if(response.code == 200 && payload.access_token){
            var token = response.json().access_token.replace("Bearer","").trim()
            pm.collectionVariables.set("jwttoken", token);
            console.log(`New token has been set: ${token}`);
        }
        else {
            throw new Error(`Could not log in, details below: ${JSON.stringify(payload, 0, 2)}`);
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



// given a string, attempt to fill in any {{var}} values from the environment or collection variables
function FillFromEnvironmentOrCollection(inputString){
    var result = pm.environment.replaceIn(inputString); // attempts to fill any {{var}} values from the environment
    result = pm.collectionVariables.replaceIn(result); // attempts to fill any {{var}} values from the collection variables
    return result;
}