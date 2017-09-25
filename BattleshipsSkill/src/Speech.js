/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';

var messages;

var shipNames = ["einer", "zweier", "dreier", "vierer", "fünfer", "sechser", "siebener", "achter", "neuner", "zehner"];

function init_messages(language) {

	if (!messages) {
		if (!language) {
			language = "DE";
		}
		if (language === "DE") {

			messages = {
				ConnectGameIntent: {
					S_OK: { 
						speechOut: "Erfolgreich mit Spiel Verbunden, die Spielfeldgröße ist %1 . Setze Deine Schiffe %2.",
						display:   "Erfolgreich mit Spiel Verbunden, die Spielfeldgröße ist %1 . Setze Deine Schiffe %2."
					},
					CONFIRM: {
						speechOut: "Bitte bestätige mit ja, dass du eine neue Verbindung herstellen möchtest.",
						display :  "Bitte bestätige mit 'Ja', dass du eine neue Verbindung herstellen möchtest."
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "Die genannte Spiel Ei Di ist nicht bekannt, bitte versuche es noch einmal.",
						display:   "Die genannte Spiel-ID ist nicht bekannt, bitte versuche es noch einmal." 
					}
				},
				
				BlindGameIntent: {
					S_OK: { 
						speechOut: "Blindspiel erfolgreich gestartet, die Spielfeldgröße ist %1 . Setze Deine Schiffe %2.",
						display :  "Blindspiel erfolgreich gestartet, die Spielfeldgröße ist %1. Setze Deine Schiffe: %2."
					},
					CONFIRM: { 
						speechOut: "Bitte bestätige mit ja, dass du ein Blindspiel starten möchtest.",
						display :  "Bitte bestätige mit ja, dass du ein Blindspiel starten möchtest."
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "Es gab ein Problem beim Erstellen der Spiel Ei Di, bitte versuche es noch einmal.",
						display:   "Es gab ein Problem beim Erstellen der Spiel-ID, bitte versuche es noch einmal." 
					}
				},
	
				SetPlayerNameIntent: {
					S_OK: { 
						speechOut: "Hallo %1, mache Deinen Zug.",
						display :  "Hallo %1, mache Deinen Zug."
					}
				},
				
				PlayerMoveQueryIntent: {
					S_OK: { 
						speechOut: "%1 ist %2.",
						display :  "%1 ist %2."
					},
					S_CONTINUE: { 
						speechOut: "Sehr gut, %1 ist %2. Du bist nochmal dran.",
						display :  "Sehr gut, %1 ist %2. Du bist nochmal dran."
					},
					S_PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, Du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, Du hast gewonnen."
					},
					E_INVALID_MOVE: { 
						speechOut: "%1 ist %2. Leider können deine Angaben nicht stimmen, ich kann nichts mehr fragen und habe nicht alle Schiffe gefunden.",
						display :  "%1 ist %2. Leider können deine Angaben nicht stimmen, ich kann nichts mehr fragen und habe nicht alle Schiffe gefunden."
					},
					E_INVALID_RANGE: { 
						speechOut: "Das liegt ausserhalb des Spielfeldes.",
						display :  "Das liegt ausserhalb des Spielfeldes."
					},
				},
				
				PlayerMoveAnswerIntent: {
					S_OK: { 
						speechOut: "Du bist dran.",
						display :  "Du bist dran."
					},
					S_CONTINUE: { 
						speechOut: " ",
						display :  " "
					},
					S_PLAYER_WINS: { 
						speechOut: "Ich habe gewonnen.",
						display :  "Ich habe gewonnen."
					}
				},
				
/*
				PlayerMoveIntent: {
					S_PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, du hast gewonnen."
					},
					S_DRAW: { 
						speechOut: "Das Spiel endet unentschieden.",
						display :  "Das Spiel endet unentschieden."
					},
					S_OK: { 
						speechOut: "Ich werfe in Reihe %1.",
						display :  "Ich werfe in Reihe %1."
					},
					S_AI_PLAYER_WINS: { 
						speechOut: "Ich werfe in Reihe %1 und gewinne.",
						display :  "Ich werfe in Reihe %1 und gewinne."
					},
					S_AI_DRAW: { 
						speechOut: "Ich werfe in Reihe %1 und es ist unentschieden.",
						display :  "Ich werfe in Reihe %1 und es ist unentschieden."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Reihe nicht verstanden. Sage eine Zahl von eins bis sieben.",
						display :  "Ich habe die Reihe nicht verstanden. Sage eine Zahl von 1-7."
					},
					E_INVALID_MOVE: {
						speechOut: "In diese Reihe kann kein Stein mehr geworfen werden",
						display :  "In diese Reihe kann kein Stein mehr geworfen werden."
					},
					E_GAME_FINISHED: { 
						speechOut: "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: Neues Spiel.",
						display :  "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: 'Neues Spiel'"
					}

				},
*/				
				SetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke wurde auf %1 gesetzt.",
						display :  "Die Spielstärke wurde auf %1 gesetzt."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Spielstärke nicht verstanden. Sage eine Zahl von eins bis sieben.",
						display :  "Ich habe die Spielstärke nicht verstanden. Sage eine Zahl von 1-7."
					},
				}, 
				
				GetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke steht auf %1.",
						display :  "Die Spielstärke steht auf %1."
					}
				},
				
				SetFieldSizeIntent: {
					S_OK: { 
						speechOut: "Die Spielfeldgröße wurde auf %1 geändert. Setze Deine Schiffe %2 . Mache dann Deinen Zug.",
						display :  "Die Spielfeldgröße wurde auf %1 geändert. Setze Deine Schiffe: %2. Mache dann Deinen Zug."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Spielfeldgröße nicht verstanden. Sage eine Zahl von zwei bis zehn.",
						display :  "Ich habe die Spielfeldgröße nicht verstanden. Sage eine Zahl von 2-10."
					},
				}, 
				
				IssueHelpIntent: {
					"*": {
						speechOut: "Allgemeine Hilfe zum Schiffe versenken Spiel: Um das Spiel mit Visualisierung zu spielen musst du die Webseite Kalk Box Punkt d. e. in einem Browser öffnen. Ich buchstabiere die URL  c. a. l. c. b. o. x. Punkt d. e. Willst du ohne Visualisierung spielen, dann sage Starte ein Blindspiel. Für weitere Infos sage Hilfe zur Sprachsteuerung.",
						display :  "Allgemeine Hilfe zum Schiffe-Versenken Spiel: Um das Spiel mit Visualisierung zu spielen musst du die Webseite 'http://calcbox.de' in einem Browser öffnen. Willst du ohne Visualisierung spielen,  dann sage 'Starte ein Blindspiel'. Für weitere Infos sage 'Hilfe zur Sprachsteuerung'."
					},
					SPRACHSTEUERUNG: {
						speechOut: "Wenn Du am Zug bist, dann nenne ein Feld durch Angabe der Reihe A bis J gefolgt von der Spalte 1 bis 10 - Wurdest du nach einem Feld gefragt, dann Antworte mit Wasser, Treffer oder Versenkt. Mit Hilfe startest du die Hilfe. Mit Ändere die Spielfeldgröße kannst du die Spielfeldgröße auf einen Wert von 2 bis 10 setzen. Mit Neues Spiel startest Du ein neues Spiel. Mit Beenden beendest du das Spiel. Mit der Frage Wer ist dran erhältst du Informationen über den aktuellen Spielstand.",
						display :  "Wenn Du am Zug bist, dann nenne ein Feld durch Angabe der Reihe (A-J) gefolgt von der Spalte (1-10). Wurdest du nach einem Feld gefragt, dann Antworte mit 'Wasser', 'Treffer' oder 'Versenkt'. Mit 'Hilfe' startest du die Hilfe. Mit 'Ändere die Spielfeldgröße auf ...' kannst du die Spielfeldgröße auf einen Wert von 2-10 setzen. Mit 'Neues Spiel' startest Du ein neues Spiel. Mit 'Beenden' beendest du das Spiel. Mit der Frage 'Wer ist dran?' erhältst du Informationen über den aktuellen Spielstand."
					},
				},
				
				RestartGame: {
					play1Q: { 
						speechOut: "Du bist Verbunden mit dem Spiel %1 - Die Spielfeldgröße ist %2 - Die Anzahl Schiffe ist %3 - Du bist am Zug.",
						display :  "Du bist Verbunden mit dem Spiel %1 . Die Spielfeldgröße ist %2 . Die Anzahl Schiffe ist %3 . Du bist am Zug."
					},
					play2A: { 
						speechOut: "Du bist Verbunden mit dem Spiel %1 - Die Spielfeldgröße ist %2 - Die Anzahl Schiffe ist %3 ",
						display :  "Du bist Verbunden mit dem Spiel %1 . Die Spielfeldgröße ist %2 . Die Anzahl Schiffe ist %3 . "
					},
					play1F: { 
						speechOut: "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten.",
						display :  "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten."
					},
					play2F: { 
						speechOut: "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten.",
						display :  "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten."
					}
				},
				
				Launch: {
					play1Q: { 
						speechOut: "Das Spiel mit der Ei die %1 wird fortgesetzt. Du bist dran.",
						display :  "Das Spiel mit der ID %1 wird fortgesetzt. Du bist dran."
					},
					play2A: { 
						speechOut: "Das Spiel mit der Ei die %1 wird fortgesetzt.",
						display :  "Das Spiel mit der ID %1 wird fortgesetzt."
					},
					play1F: { 
						speechOut: "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten.",
						display :  "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten."
					},
					play2F: { 
						speechOut: "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten.",
						display :  "Das Spiel ist beendet. Sage Neues Spiel um eine neues Spiel zu starten."
					}
				},
				
				REDOAIMOVE: {
					S_OK: {
						speechOut: "%1 Ich bin dran. Was ist auf %2.",
						display :  "%1 Ich bin dran. Was ist auf %2."
					},
					E_INVALID_MOVE: { 
						speechOut: "Leider können deine Angaben nicht stimmen, ich kann nichts mehr fragen und habe nicht alle Schiffe gefunden.",
						display :  "Leider können deine Angaben nicht stimmen, ich kann nichts mehr fragen und habe nicht alle Schiffe gefunden."
					}
				},
				
			    "AMAZON.StartOverIntent": {
			    	"CONFIRM": {
				    	speechOut: "Bitte bestätige mit ja, dass du ein neues Spiel starten möchtest.", 
				    	display :  "Bitte bestätige mit 'JA', dass du ein neues Spiel starten möchtest."
			    	},
			    	"S_OK": {
				    	speechOut: "Neues Spiel, neues Glück.", 
				    	display :  "Neues Spiel, neues Glück."
			    	}
			    },
			    
			    "AMAZON.StopIntent": {
			    	"CONFIRM": {
				    	speechOut: "Bitte bestätige mit ja, dass du das Spiel beenden möchtest.", 
				    	display :  "Bitte bestätige mit ja, dass du das Spiel beenden möchtest."
			    	},
			    	"*": {
			    		speechOut: "Auf wiederhören, bis zum nächsten Mal.", 
			    		display :  "Auf wiederhören, bis zum nächsten Mal."
			    	}
			    },
			    
	    		MESSAGE: {
	    			INVALIDCONFIRMATION: {
	    				speechOut: "Das sollte nicht passieren, unbekannte Bestätigung! Das Spiel wird beendet, sorry.",
	    				display: "Das sollte nicht passieren, unbekannte Bestätigung '%1'! Das Spiel wird beendet, sorry."
	    			},
	    			NO_YESNO_QUESTION: {
	    				speechOut: "Ich hatte keine Ja Nein Frage gestellt. ",
	    				display: "Ich hatte keine Ja Nein Frage gestellt. "
	    			}
	    		},
			    
	    		PHASEHELP: {
	    			INIT: {
	    				speechOut: " Öffne die Webseite Kalk Box Punkt D E in einem Browser und nennen mir die angezeigte Spiel Ei die, um das Spiel auf dem Monitor zu verfolgen oder sage: Starte ein Blindspiel.",
	    				display: " Öffne die Webseite http://calcbox.de in einem Browser und nennen mir die angezeigte Spiel-ID um das Spiel auf dem Monitor zu verfolgen oder sage: 'Starte ein Blindspiel'."
	    			},
	    			PLAY1Q_LONG: {
	    				speechOut: " Du bist dran und musst einen Zug machen. Mit dem Schlüsselwort Hilfe zur Sprachsteuerung bekommst du eine ausführliche Hilfe.",
	    				display: " Du bist dran und musst einen Zug machen. Mit dem Schlüsselwort 'Hilfe zur Sprachsteuerung' bekommst du eine ausführliche Hilfe."
	    			},
	    			PLAY1Q_SHORT: {
	    				speechOut: " Du bist dran.",
	    				display: " Du bist dran."
	    			},
	    			PLAY2A_LONG: {
	    				speechOut: " Du musst entweder Wasser, Treffer oder Versenkt sagen. Mit dem Schlüsselwort Hilfe bekommst du eine ausführliche Hilfe.",
	    				display: " Du musst entweder 'Wasser', 'Treffer' oder 'Versenkt' sagen. Mit dem Schlüsselwort 'Hilfe' bekommst du eine ausführliche Hilfe."
	    			},
	    			PLAY2A_SHORT: {
	    				speechOut: " ",
	    				display: " "
	    			},
	    			PLAYF: {
	    				speechOut: " Das aktuelle Spiel ist beendet, mit dem Kommando Neues Spiel kannst Du ein neues Spiel starten.",
	    				display: " Das aktuelle Spiel ist beendet, mit dem Kommando 'Neues Spiel' kannst Du ein neues Spiel starten."
	    			},
	    			UNKNOWN: {
	    				speechOut: " Ich befinde mich in einer unbekannten Phase %1 und beende mich jetzt lieber, sorry.",
	    				display: " Ich befinde mich in einer unbekannten Phase (%1) und beende mich jetzt lieber, sorry."
	    			}
	    		},
	    		
	    		
	    		
				Generic: {
					E_UNKNOWN_ERROR: {
						speechOut: "Es ist ein unerwarteter Fehler aufgetreten.",
						display: "Es ist ein unerwarteter Fehler aufgetreten.",
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "Deine Verbindung wurde beendet. Bitte baue eine neue Verbindung mit Kalk Box Punkt D E auf oder sage: Starte ein Blindspiel.",
						display:   "Deine Verbindung wurde beendet. Bitte baue eine neue Verbindung mit https://calcbox.de/conn4 auf oder sage: 'Starte ein Blindspiel'." 
					}
				}
			}
			
		}
		
	}
}

function respond(intentName, resultCode, response, param1, param2, param3) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = {
				speechOut: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode,
				display: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode
		}
	}
	msg = setParams(msg, param1, param2, param3);
	respondMsg(msg, response)
}

function respondMsg(msg, response) {
	response.askWithCard(msg.speechOut, "Schiffe-Versenken Skill", msg.display);
}

function getMsg(intentName, resultCode, param1, param2, param3) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = {
				speechOut: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode,
				display: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode
		}
	}
	msg = setParams(msg, param1, param2, param3);
	return msg;
}

function hasMsg(intentName, resultCode) {
	if (!messages[intentName]) {
		return false;
	}
	if (!messages[intentName][resultCode]) {
		return false;
	}
	return true;
}

function goodbye(intentName, resultCode, response, param1, param2, param3) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = {
				speechOut: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode,
				display: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode
		}
	}
	msg = setParams(msg, param1, param2, param3);
	goodbyeMsg(msg, response);
}

function goodbyeMsg(msg, response) {
	response.tellWithCard(msg.speechOut, "Schiffe-Versenken Skill", msg.display);
}

function setParams(msg, param1, param2, param3) {
	var result = msg;
	if (msg) {
		result = replace(result, "%1", param1);
		result = replace(result, "%2", param2);
		result = replace(result, "%3", param3);
	}
	return result;
}

function replace(msg, varName, param) {
	if (!param) {
		return msg;
	}
	if (param.speechOut) {
		return {
			speechOut: msg.speechOut.replace(varName, param.speechOut).trim(),
			display:   msg.display.replace(varName, param.display).trim()
		}
	}
	return {
		speechOut: msg.speechOut.replace(varName, param).trim(),
		display:   msg.display.replace(varName, param).trim()
	}
}

function rowCol2Words(row, col) {
	return row + " " + col;
}

function gameId2Words(id) {
	if (id && id.length > 1) {
		return id.substring(0,1) + " " + id.substring(1);
	}
	return id;
}

function content2Words(content) {
	if (content === "WATER") {
		return "Wasser";
	}
	if (content === "SHIP") {
		return "Treffer";
	}
	if (content === "SUNK") {
		return "Versenkt";
	}
	return content;
}


function createNumShipsWords(numShips) {
	var text = "";
	if (numShips) {
		var seperator = "";
		for (var i=numShips.length-1; i>=0; i--) {
			if (numShips[i] !== 0) {
				if (numShips[i] === 1) {
					text = text + seperator + "ein " + shipNames[i];
				}
				else {
					text = text + seperator + (i+1) + " " + shipNames[i];
				}
				seperator = ", ";
			}
		}
	}
	return text;
}


module.exports = {init_messages, respond, respondMsg, goodbye, goodbyeMsg, getMsg, hasMsg, rowCol2Words, content2Words, createNumShipsWords, gameId2Words};
