
        var skill;
        const DEFAULT_AGENT_LANGUAGE = "en";
        var translation = {
            from: null,
            to: DEFAULT_AGENT_LANGUAGE,
        };
        var clientChatLine = "";
        var clientChatSelector = "#selectClientLanguage";
        var agentChatSelector = "#selectAgentLanguage";
        var languageModels;
        var SDK = lpTag.agentSDK;
        var historyIndex = null;
        SDK.init();
        var loadLanguages = function(data){
            languageModels = data.languages.models
            if(data.skillFound){
                translation.from = data.from;
                translation.to = data.to;
            } else {
                translation.from = null;
                translation.to = null;
            }
            showLanguages();
            if(translation.from && translation.to && clientChatLine)
                translate(translation.from, translation.to, clientChatLine, onProgress, onError, onCompleteVisitor);
        }

        var clientLanguageSelectionChanged = function(selection){
            translation.from = $(clientChatSelector).val();
            translation.to = DEFAULT_AGENT_LANGUAGE;
            showLanguages();
            translate(translation.from, translation.to, clientChatLine, onProgress, onError, onCompleteVisitor);
        }

        var agentLanguageSelectionChanged = function(selection){
            translation.to = $(agentChatSelector).val();
            showLanguages();
            translate(translation.from, translation.to, clientChatLine, onProgress, onError, onCompleteVisitor);
        }

        var showLanguages = function(){
            generateOptions(translation.from, translation.from, false, clientChatSelector);
            generateOptions(translation.from, translation.to, true, agentChatSelector);
        }
        //success function for getting the engagement info from the sdk
        var onSuccess = function(data) {
            //if the skill is not set, it will be a null value, not unskilled
            skill = data.skill;
            language(skill, loadLanguages);
            console.log(data);
        };
        //error is called if we are not able to get the engagement infor from the sdk
        var onError = function(err) {
            // Do something with the error
            console.log(err);
        };

        var translatePrevious = function(){
            document.getElementById("previousButton").disabled = true; 
            if(visitorChatHistory.length == 0){
                onCompleteVisitorPrevious("There is no previous message.");
                return;
            }
            
            translateVisitor(onCompleteVisitorPrevious);
        }

        //path to the engagementInfo from the sdk
        var pathToEngagementInfo = "engagementInfo";
        SDK.get(pathToEngagementInfo, onSuccess, onError);

        var visitorChatHistory = [];

        var updateCallback = function(data) {
            // called each time the value is updated; if there is an existing value when bind
            //is called - this callback will be called with the existing value
            var newData = data.newValue.lines.filter(line => line.source === 'visitor')

            visitorChatHistory = visitorChatHistory.concat(newData);

            // var lastIndex = visitorChatHistory.lastIndexOf(true);

            // if (historyIndex == null)
                // historyIndex = lastIndexOf - 1;
            //add new chat line to page if it is from the visitor
            // if (lastIndex !== -1) {
                //strip the html elements from the chat line
                // clientChatLine = stripHTMLTags(data.newValue.lines[lastIndex].text);
            if(newData.length !== 0) {
                translateVisitor(onCompleteVisitor);

            }
        };

        var translateVisitor = function(onComplete){
            clientChatLine = stripHTMLTags(visitorChatHistory.pop().text);
                
            if(translation.from && translation.to && clientChatLine)
                translate(translation.from, translation.to, clientChatLine, onProgress, onError, onComplete);
        }

        var notifyWhenDone = function(err) {
            if (err) {
                // Do something with the error
            }
            // called when the bind is completed successfully,
            // or when the action terminated with an error
        };

        //path to the chat transcript from the sdk
        var pathToData = "chatTranscript";
        // bin the chat transcript so it will listen for new chatlines
        SDK.bind(pathToData, updateCallback, notifyWhenDone);
        //translate the agents message
        function translateChat() {
            var text = document.getElementById('agentChat').value;
            
            //inverse translation for agent chat
            translate(translation.to, translation.from, text, onProgress, onError, onCompleteAgent)
            
        }
        //called when the translation is complete
        function onCompleteAgent(translation) {
            //get the translated text
            var data = {
                text: translation
            };
            //send the translation to the agent console
            SDK.command('Write ChatLine', data);
        }

        //called when the translation is complete
        function onCompleteVisitorPrevious(translation) {
            //update the text area with the translation
            document.getElementById('visitorChat').value = "Visitor: "+translation+"\n" + document.getElementById('visitorChat').value; 
            document.getElementById("previousButton").disabled = false; 
        }

        //called when the translation is complete
        function onCompleteVisitor(translation) {
            //update the text area with the translation
            document.getElementById('visitorChat').value = document.getElementById('visitorChat').value + "Visitor: "+translation+"\n"; 
        }
        //called while the translation is in progress
        function onProgress(value) {

        }
        //called if there is an error translating
        function onError(error) {
            alert("Translation Error: " + error);
        }
        //called when the widget is closed
        // function onRestoreOriginal() {
            //alert("The page was reverted to the original language. This message is not part of the widget.");
        // }

        var generateOptions = function(fromLanguage, selectedLanguage, agent = false, targetSelector) {

            var array = [];

            if(languageModels) {
                array = getAppropriateLanguages(fromLanguage, agent);
            } 

            var target = $(targetSelector);
            target.empty();
            

            var unusedSelectedLanguage = true;
            if(!selectedLanguage && agent)
                selectedLanguage = translation.to = array[0];

            array.forEach(function(value) {
                if(value == selectedLanguage){
                    target.append("<option value='" + value + "' selected='true'>" + value + "</option>");
                    unusedSelectedLanguage = false;
                } else {
                    target.append("<option value='" + value + "'>" + value + "</option>");
                }
            });
            if(unusedSelectedLanguage)
                target.append("<option value=' + null + ' selected='true'>" + "unset" + "</option>");
        }

        //for agent (agent=true) request returns only supported target languages from 'language'
        //for cleint (agent=false) request return all supported languages
        var getAppropriateLanguages = function(language, agent) {
            const set = new Set();
            languageModels.forEach(function(model) {
                if(agent){
                    if(model.source == language)
                        set.add(model.target)
                } else {
                    set.add(model.source)
                }
            });

            let array = Array.from(set).sort();

            return array;
        }

        function stripHTMLTags(html) {
           var tmp = document.createElement("DIV");
           tmp.innerHTML = html;
           return tmp.textContent || tmp.innerText || "";
        }
    