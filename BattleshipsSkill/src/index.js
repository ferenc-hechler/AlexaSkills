/**
    Copyright 2016-2017 Ferenc Hechler
*/

/**
 * Play Battleships against Alexa.
 *
 * Examples:
 *  open a browser showing the game-visualization-page https://calcbox.de
 *  User:  "Alexa starte schiffe versenken."
 *  Alexa: "Verbind dich mit einer Spiel ID oder starte ein Blindspiel."
 *  User:  "Meine Spiel ID ist E 37"
 *  Alexa: "Erfolgreich mit Spiel verbunden. Mache Deinen Zug"
 *  User:  "C4"
 *  Alexa: "Auf C4 ist Wasser. Was ist auf A1?"
 *  User:  "Treffer"
 *  Alexa: ...
 *  
 */

/**
 * App ID for the skill
 */
var APP_ID = "*"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var endpoint = 'http://localhost:8080/AIGamesRestService/rest/bs';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');
speech.init_messages("DE");

var http = require('http');


/**
 * BattleshipsSkill is a child of AlexaSkill.
 */
var BattleshipsSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
BattleshipsSkill.prototype = Object.create(AlexaSkill.prototype);
BattleshipsSkill.prototype.constructor = BattleshipsSkill;

BattleshipsSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("BattleshipsSkill onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
    clearSessionData(session);
    setPhase("init", session);
};

BattleshipsSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
	return execReconnectGame(session, response);
}

BattleshipsSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("BattleshipsSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
    clearSessionData(session);
};

BattleshipsSkill.prototype.intentHandlers = {
		
    "ConnectGameIntent": function (intent, session, response) {
    	var gameId = getGameId(intent);
    	console.log("GAMEID: "+gameId);
		if (isInPhase("init", session)) {
			execConnectGame(gameId, session, response);
		}
		else {
	    	setConfirmation(intent.name, session, gameId);
	        speech.respond(intent.name, "CONFIRM", response);
		}
    },
    
    "BlindGameIntent": function (intent, session, response) {
		if (isInPhase("init", session)) {
			execStartBlindGame(session, response);
		}
		else {
	    	setConfirmation(intent.name, session);
	        speech.respond(intent.name, "CONFIRM", response);
		}
    },

    "SetPlayerNameIntent": function (intent, session, response) {
    	console.log(intent);
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	var playerName = getPlayerName(intent);
    	sendCommand(session, getSessionGameId(session), "setPlayerNames", playerName, "Alexa", "", "", function callbackFunc(result) {
            console.log(intent.name+": sessionId: " + session.sessionId+", res: "+result.code);
            if (result.code === "S_OK") {
            	setSessionPlayername(session, playerName);
                speech.respond(intent.name, result.code, response, playerName);
            }
            else {
            	handleUnknownGameId(result, session);
                speech.respond(intent.name, result.code, response);
            }
        });
    },

    "PlayerMoveQueryIntent": execPlayerMoveQuery, 

    "PlayerMoveAnswerIntent": execPlayerMoveAnswer,

    "SetAILevelIntent": function (intent, session, response) {
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	var aiLevel = getAILevel(intent);
        console.log("AILEVEL1=" + aiLevel);
    	sendCommand(session, getSessionGameId(session), "setAILevel", aiLevel, "", "", "", function callbackFunc(result) {
            console.log("AILEVEL2=" + aiLevel);
            console.log(intent.name+": aiLevel: " + aiLevel + " sessionId: " + session.sessionId+", res: "+result.code);
            speech.respond(intent.name, result.code, response, aiLevel);
        });
    },

    "GameStateIntent": function (intent, session, response) {
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	execRestartGame(getSessionGameId(session), session, response);
    },

    "SetFieldSizeIntent": function (intent, session, response) {
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	var fieldSize = getFieldSize(intent);
        console.log("FIELDSIZE=" + fieldSize);
        var gameId = getSessionGameId(session);
    	sendCommand(session, gameId, "changeGameParameter", "FIELDSIZE", fieldSize, "", "", function callbackFunc(result) {
            console.log("FIELDSIZE=" + fieldSize);
            console.log(intent.name+": FIELDSIZE: " + fieldSize + " sessionId: " + session.sessionId+", res: "+result.code);
            if (result.code === "S_OK") {
            	execRestartGame(gameId, session, response);
            }
            else {
            	speech.respond(intent.name, result.code, response, fieldSize);
            }
        });
    },

    
    
    "AMAZON.StartOverIntent": function (intent, session, response) {
    	setConfirmation(intent.name, session);
        speech.respond(intent.name, "CONFIRM", response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
//    	setConfirmation(intent.name, session);
//        speech.respond(intent.name, "CONFIRM", response);
//    	sendCommand(session, getSessionGameId(session), "closeGame", "", "", "", "", function callbackFunc(result) {
//            console.log(intent.name + session.sessionId+", result: "+result.code);
            clearSessionData(session);
            speech.goodbye(intent.name, "*", response);
//        });
    },

    "IssueHelpIntent": function (intent, session, response) {
    	var issue = getIssue(intent);
    	if (issue) {
    		issue = issue.toUpperCase();
    	}
    	issueHelp(issue, session, response);
    },
    
    "AMAZON.HelpIntent": function (intent, session, response) {
    	setLongHelp(session);
    	phaseHelp("", session, response);
    },
    

    "AMAZON.YesIntent": function (intent, session, response) {
    	var confirmation = getConfirmation(session, "?");
    	var confirmParam = getConfirmParam(session, "?");
    	console.log("confirmParam="+confirmParam);
    	if (confirmation === "?") {
    		setShortHelp(session);
    		phaseHelp("Ich hatte keine Ja Nein Frage gestellt. ", session, response);
    		return;
    	}
    	clearConfirmation(session)
    	if (confirmation === "AMAZON.StartOverIntent") {
    		var gameId = getSessionGameId(session);
	    	sendCommand(session, gameId, "newGame", "", "", "", "", function callbackFunc(newGameResult) {
	            console.log("CONFIRMED-"+confirmation + ": sessionId: " + session.sessionId+", result: "+newGameResult.code);
	    		if (newGameResult.code == "S_OK") {
	    			execRestartGame(gameId, session, response);
	    		}
	    		else {
	            	speech.respond(confirmation, newGameResult.code, response);
	    		}
	        });
    	}
    	else if (confirmation === "BlindGameIntent") {
    		execStartBlindGame(session, response);
    	}
    	else if (confirmation === "ConnectGameIntent") {
    		console.log(session);
    		var gameId = confirmParam;
    		execConnectGame(gameId, session, response);
    	}
    	
    	else {
    		speech.goodbye("MESSAGE", "INVALIDCONFIRMATION", response, confirmation);
    	}
    },
    
    "AMAZON.NoIntent": function (intent, session, response) {
    	var confirmation = getConfirmation(session, "?");
    	if (confirmation === "?") {
    		setShortHelp(session);
    		var prefixMsg = speech.getMsg("MESSAGE", "NO_YESNO_QUESTION", response, confirmation);
    		phaseHelp("Ich hatte keine Ja Nein Frage gestellt. ", session, response);
    		return;
    	}
        response.askWithCard("Okay, weiter gehts!", "Schiffe-Versenken Skill", "OK, weiter gehts!");
    }

    
};



function handleUnknownGameId(result, session) {
	if (result.code === "E_UNKNOWN_GAMEID") {
    	clearSessionData(session);
    	setPhase("init", session);
	}
}

function execConnectGame(gameId, session, response) {
	sendCommand(session, gameId, "activateGame", session.user.userId, "", "", "", function callbackFunc(result) {
        console.log("gid: "+ gameId + ", sessionId: " + session.sessionId+", res: "+result.code);
        if (result.code === "S_OK") {
        	execRestartGame(gameId, session, response);
        }
        else {
        	speech.respond("ConnectGameIntent", result.code, response);
        }
    });

}

function execStartBlindGame(session, response) {
	sendCommand(session, "", "createSessionlessGame", session.user.userId, "", "", "", function callbackFunc(result) {
        console.log("createSessionlessGame: sessionId: " + session.sessionId+", res: "+result.code);
        if (result.code === "S_OK") {
        	var gameId = result.gameId;
        	execRestartGame(gameId, session, response);
        }
        else {
        	speech.respond(intent.name, result.code, response);
        }
    });
}

function execReconnectGame(session, response) {
    sendCommand(session, "", "getGameDataByUserId", session.user.userId, "", "", "", function callbackFunc(gameDataResult) {
    	if (gameDataResult.code === "S_OK") {
            console.log("reconnect to GameId: " + gameDataResult.gameId);
        	setSessionGameId(session, gameDataResult.gameId);
        	var phase = "play"+gameDataResult.currentPlayer+gameDataResult.gamePhase;
        	setPhase(phase, session);
        	if (phase === "play2A") {
        		// repeat querying from ai (redoAIMove)
        		var prefixMsg = speech.getMsg("Launch", phase, speech.gameId2Words(gameDataResult.gameId));
        		redoAiMove(session, response, prefixMsg);
        	}
        	else {
        		speech.respond("Launch", phase, response, speech.gameId2Words(gameDataResult.gameId));
        	}
    	}
    	else {
	        var speechOut = "Willkommen zum Schiffe versenken Spiel. Zuerst musst du eine Verbindung mit der Webseite Kalk Box Punkt D E aufbauen, damit du das Spiel auf deinem Monitor mitverfolgen kannst. Um ein Spiel ohne Monitor zu starten sage: Starte ein Blindspiel.";
	        var repromptText = "Bitte sage mir die Spiel Ei die, die du auf der Webseite Kalk Box Punkt D E , ich buschtabiere c. a. l. c. b. o. x. Punkt d. e. , siehst. Verwende dazu die folgende Floskel: Meine Spiel Ei Di ist";
	        var display = "Willkommen zum Schiffe-Versenken Spiel. Zuerst musst Du eine Verbindung mit der Webseite http://calcbox.de aufbauen, damit Du das Spiel auf dem Monitor mitverfolgen kannst. Um ein Spiel ohne Monitor zu starten sage: 'Starte ein Blindspiel'.";
	        response.askWithCard(speechOut, repromptText, "Schiffe-Versenken Skill", display);
    	}
    });
}



function execRestartGame(gameId, session, response) {
	sendCommand(session, gameId, "getGameData", "", "", "", "", function callbackFunc(gameDataResult) {
        console.log("Restart Game with GameId: " + gameDataResult.gameId);
    	setSessionGameId(session, gameDataResult.gameId);
    	var phase = "play"+gameDataResult.currentPlayer+gameDataResult.gamePhase;
    	setPhase(phase, session);
    	var fieldSize = "";
    	var ships = "";
        if (gameDataResult.code === "S_OK") {
        	ships = speech.createNumShipsWords(gameDataResult.fieldView.numShips);
        	fieldSize = ""+gameDataResult.fieldView.p1Field.length;
        }
    	if (phase === "play2A") {
    		// repeat querying from ai (redoAIMove)
    		var prefixMsg = speech.getMsg("RestartGame", phase, speech.gameId2Words(gameDataResult.gameId), fieldSize, ships);
    		redoAiMove(session, response, prefixMsg);
    	}
    	else {
    		speech.respond("RestartGame", phase, response, speech.gameId2Words(gameDataResult.gameId), fieldSize, ships);
    	}    	
	});
}

function execPlayerMoveQuery(intent, session, response) {
	if (isInPhase("init", session)) {
	    console.log("continue in execPlayerMoveQuery, sessionId: " + session.sessionId + ", userID: " + session.user.userId);
	    sendCommand(session, "", "getGameDataByUserId", session.user.userId, "", "", "", function callbackFunc(gameDataResult) {
	    	if (gameDataResult.code === "S_OK") {
	            console.log("reconnect to GameId: " + gameDataResult.gameId);
	        	setSessionGameId(session, gameDataResult.gameId);
	        	var phase = "play"+gameDataResult.currentPlayer+gameDataResult.gamePhase;
	        	setPhase(phase, session);
	    	    execPlayerMoveQuery(intent, session, response);
	    	}
	    	else {
            	handleUnknownGameId(gameDataResult, session);
		    	speech.respond(intent.name, gameDataResult.code, response);
	    	}
	    });
	    return;
	}
	if (!checkPhase("play1Q", session, response)) {
		return;
	}
	var row = getRow(intent);
	var column = getColumn(intent);
	sendCommand(session, getSessionGameId(session), "doMove", "Q", row, column, "", function callbackFunc(doMoveResult) {
        console.log(intent.name+": Q:" + row + column + " sessionId: "+ session.sessionId+", res: "+doMoveResult.code);
        if ((doMoveResult.code === "S_PLAYER_WINS")) {
        	sendCommand(session, getSessionGameId(session), "closeGame", "", "", "", "", function callbackFunc(closeGameResult) {
            	clearSessionData(session);
            	speech.goodbye(intent.name, doMoveResult.code, response);
        	});
        }
        else if (doMoveResult.code === "S_CONTINUE") {
        	speech.respond(intent.name, doMoveResult.code, response, speech.rowCol2Words(doMoveResult.move.row, doMoveResult.move.col), speech.content2Words(doMoveResult.move.content));
        }
        else if (doMoveResult.code === "S_OK") {
    		var prefixMsg = speech.getMsg(intent.name, doMoveResult.code, speech.rowCol2Words(doMoveResult.move.row, doMoveResult.move.col), speech.content2Words(doMoveResult.move.content));
    		redoAiMove(session, response, prefixMsg);
        }
        else {
        	handleUnknownGameId(doMoveResult, session);
        	speech.respond(intent.name, doMoveResult.code, response);
        }
    });
}

function execPlayerMoveAnswer(intent, session, response) {
	if (isInPhase("init", session)) {
	    console.log("continue in execPlayerMoveAnswer, sessionId: " + session.sessionId + ", userID: " + session.user.userId);
	    sendCommand(session, "", "getGameDataByUserId", session.user.userId, "", "", "", function callbackFunc(gameDataResult) {
	    	if (gameDataResult.code === "S_OK") {
	            console.log("reconnect to GameId: " + gameDataResult.gameId);
	        	setSessionGameId(session, gameDataResult.gameId);
	        	var phase = "play"+gameDataResult.currentPlayer+gameDataResult.gamePhase;
	        	setPhase(phase, session);
	    	    execPlayerMoveAnswer(intent, session, response);
	    	}
	    	else {
	        	handleUnknownGameId(gameDataResult, session);
		    	speech.respond(intent.name, gameDataResult.code, response);
	    	}
	    });
	    return;
	}
	if (!checkPhase("play2A", session, response)) {
		return;
	}
	var content = getContent(intent);
	sendCommand(session, getSessionGameId(session), "doMove", "A", "?", "?", content, function callbackFunc(doMoveResult) {
	    console.log(intent.name+": A:" + content + " sessionId: " + session.sessionId+", res: "+doMoveResult.code);
	    if ((doMoveResult.code === "S_AI_PLAYER_WINS")) {
	    	sendCommand(session, getSessionGameId(session), "closeGame", "", "", "", "", function callbackFunc(closeResult) {
	        	clearSessionData(session);
	        	speech.goodbye(intent.name, doMoveResult.code, response);
	    	});
	    }
	    else if (doMoveResult.code === "S_OK") {
	    	setPhase("play1Q", session);
	    	speech.respond(intent.name, doMoveResult.code, response, doMoveResult.content);
	    }
	    else if (doMoveResult.code === "S_CONTINUE") {
			var prefixMsg = speech.getMsg(intent.name, doMoveResult.code);
			console.log("prefixMsg=");
			console.log(prefixMsg);
			redoAiMove(session, response, prefixMsg);
	    }
	    else {
        	handleUnknownGameId(doMoveResult, session);
	    	speech.respond(intent.name, doMoveResult.code, response);
	    }
	});
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the BattleshipsSkill skill.
    var battleshipsSkill = new BattleshipsSkill();
    battleshipsSkill.execute(event, context);
};

// initialize tests
exports.initTests = function (url, param, callback) {
	endpoint = url;
	sendCommand([], "?", "initTests", param, "", "", "", function callbackFunc(result) {
		console.log(result);
		callback();
	});
}


function checkPhase(comparePhase, session, response) {
	var confirmation = getConfirmation(session, "?");
	clearConfirmation(session);
	if (confirmation !== "?") {
	    response.askWithCard("Ich werte das als Nein, weiter gehts!", "Schiffe-Versenken Skill", "ich werte das als Nein, weiter gehts!");
	    return false;
	}
	if (!isInPhase(comparePhase, session)) {
		wrongPhaseResponse(session, response);
		return false;
	}
	return true;
}

function clearSessionData(session) {
	session.attributes = {};
}

function issueHelp(issue, session, response) {
	console.log("ISSUE="+issue);
	if (!speech.hasMsg("IssueHelpIntent", issue)) {
		issue = "*";
	}
	speech.respond("IssueHelpIntent", issue, response);
}

function wrongPhaseResponse(session, response) {
	phaseHelp("Ich habe dein Kommando nicht verstanden. ", session, response);
}

function phaseHelp(prefixMsg, session, response) {
	var phase = getPhaseFromSession(session, "?");
	var msg;
	if (phase === "init") {
		msg = speech.addMsg(prefixMsg, "PHASEHELP", "INIT");
	}
	else if (phase === "play1Q") {
		if (isLongHelp(session)) {
			msg = speech.addMsg(prefixMsg, "PHASEHELP", "PLAY1Q_LONG");
			// give the long version only once. 
			setShortHelp(session);
		}
		else {
			msg = speech.addMsg(prefixMsg, "PHASEHELP", "PLAY1Q_SHORT");
		}
	}
	else if (phase === "play2A") {
		var prefixMsg;
		if (isLongHelp(session)) {
			prefixMsg = speech.addMsg(prefixMsg, "PHASEHELP", "PLAY2A_LONG");
			// give the long version only once. 
			setShortHelp(session);
		}
		else {
			prefixMsg = speech.addMsg(prefixMsg, "PHASEHELP", "PLAY2A_SHORT");
		}
		redoAiMove(session, response, prefixMsg);
		return;
	}
	else if ((phase === "play1F") || (phase === "play2F")) {
		msg = speech.addMsg(prefixMsg, "PHASEHELP", "PLAYF");
	}
	else {
	    console.log('UNKNOWN PHASE: ' + phase);
		msg = speech.addMsg(prefixMsg, "PHASEHELP", "UNKNOWN", phase);
		speech.goodbyeMsg(msg, response);
	    return;
	}
	speech.respondMsg(msg, response);
}


function setConfirmation(newConfirmation, session, param)  {
	session.attributes.confirmation = newConfirmation;
	session.attributes.confirmParam = param;
}
function getConfirmation(session, defaultValue)  {
	if (!session || (!session.attributes) || (!session.attributes.confirmation)) {
		return defaultValue;
	}
	return session.attributes.confirmation;
}
function getConfirmParam(session, defaultValue)  {
	if (!session || (!session.attributes) || (!session.attributes.confirmParam)) {
		return defaultValue;
	}
	return session.attributes.confirmParam;
}
function clearConfirmation(session)  {
	setConfirmation(null, session, null);
}

function setPhase(newPhase, session)  {
	session.attributes.phase = newPhase;
}
function isInPhase(comparePhase, session)  {
	var phase = getPhaseFromSession(session, "?");
	return phase.startsWith(comparePhase);
}
function getPhaseFromSession(session, defaultValue)  {
	if (!session || (!session.attributes) || (!session.attributes.phase)) {
		return defaultValue;
	}
	return session.attributes.phase;
}

function setShortHelp(session)  {
	session.attributes.shortHelp = true;
}
function setLongHelp(session)  {
	session.attributes.shortHelp = false;
}
function isShortHelp(session)  {
	if (!session || (!session.attributes) || (!session.attributes.shortHelp)) {
		return false;
	}
	return session.attributes.shortHelp === true;
}
function isLongHelp(session)  {
	return !isShortHelp(session);
}



function getPlayerName(intent) {
	return getFromIntent(intent, "player_name", "?");
}

function getIssue(intent) {
	return getFromIntent(intent, "issue", "?");
}

function getAILevel(intent) {
	return getFromIntent(intent, "ai_level", "?");
}

function getRow(intent) {
	var row = getFromIntent(intent, "row", "?");
	if (row.length > 0) {
		row = row.substring(0,1).toUpperCase();
	}
	return row;
}

function getColumn(intent) {
	return getFromIntent(intent, "column", "?");
}

function getContent(intent) {
	var content = getFromIntent(intent, "content", "?").toUpperCase();
	if ((content === "WASSER") || (content === "WATER")) {
		content = "W";
	}
	if ((content === "TREFFER") || (content === "HIT")) {
		content = "S";
	}
	if ((content === "SCHIFF") || (content === "SHIP")) {
		content = "S";
	}
	if ((content === "VERSENKT") || (content === "SUNK")) {
		content = "X";
	}
	return content;
}

function getFieldSize(intent) {
	return getFromIntent(intent, "field_size", "?");
}



function setSessionGameId(session, gameId) {
	session.attributes.gameId = gameId;
}
function getSessionGameId(session) {
	return session.attributes.gameId;
}

function setSessionPlayername(session, playername) {
	session.attributes.playername = playername;
}
function getSessionPlayername(session) {
	return session.attributes.playername;
}



function getGameId(intent) {
	return getGameIdLetter(intent, "?") + getGameIdNumber(intent, "?");
}


function getGameIdLetter(intent, defaultValue) {
	var letter = getFromIntent(intent, "gameid_letter", defaultValue);
	if (letter.length > 0) {
		letter = letter.substring(0,1);
	}
	return letter;
}

function getGameIdNumber(intent, defaultValue) {
	return getFromIntent(intent, "gameid_number", defaultValue);
}

function getFromIntent(intent, attribute_name, defaultValue) {
	var result = intent.slots[attribute_name];
	if (!result || !result.value) {
		return defaultValue;
	}
	return result.value;
}


function redoAiMove(session, response, prefixMsg) {
	sendCommand(session, getSessionGameId(session), "doAIMove", "", "", "", "", function callbackFunc(result) {
        console.log("redoAiMove: sessionId: "+ session.sessionId+", res: "+result.code);
        if (result.code === "S_OK") {
        	setPhase("play2A", session);
        	speech.respond("REDOAIMOVE", result.code, response, prefixMsg, speech.rowCol2Words(result.move.row, result.move.col));
        }
        else {
        	speech.respond("REDOAIMOVE", result.code, response, prefixMsg);
        }
	});
	
}

function sendCommand(session, gameId, cmd, param1, param2, param3, param4, callback) {

	var result = "";
	
    var queryString = '?gameId=' + gameId + '&cmd=' + cmd+ '&param1=' + param1 + '&param2=' + param2 + '&param3=' + param3 + '&param4=' + param4; 
    var url = endpoint + queryString;
    
    console.log('CALL: ' + url);
    http.get(url, function (res) {
        var responseString = '';
        if (res.statusCode != 200) {
            result = {"speechOut": "" +
            		"Verbindungsproblem, H T T P Status "+res.statusCode, "display": "Verbindungsproblem, HTTP Status "+res.statusCode};
            callback(result);
        }
        res.on('data', function (data) {
        	responseString += data;
        });
        res.on('end', function () {
            console.log("get-end: " + responseString.replace("\n", ""));
            var responseObject = JSON.parse(responseString);
            callback(responseObject);
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        result = {"speechOut": "Ausnahmefehler", "display": "Ausnahmefehler: " + e.message};
        callback(result);
    });
}




