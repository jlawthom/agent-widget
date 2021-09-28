
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

//success function for getting the engagement info from the sdk
var onSuccess = function (data) {
  //if the skill is not set, it will be a null value, not unskilled
  skill = data.skill;
  // language(skill, loadLanguages);
  console.log(data);
  console.log(data.skill);
};
//error is called if we are not able to get the engagement infor from the sdk
var onError = function (err) {
  // Do something with the error
  console.log(err);
};


//path to the engagementInfo from the sdk
var pathToEngagementInfo = "engagementInfo";
SDK.get(pathToEngagementInfo, onSuccess, onError);
