var lang = require("./lang.js");

function supportLanguages() {
  return lang.supportLanguages.map(([standardLang]) => standardLang);
}

function buildHeader(apikey) {
  return {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: "bearer " + apikey,
  };
}
function generatePrompts(mode, customizePrompt, query) {
  let userPrompt = "";
  if (mode === "1") {
    let translationPrompt = `You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.`;

    userPrompt = `${translationPrompt} from "${
      lang.langMap.get(query.detectFrom) || query.detectFrom
    }" to "${lang.langMap.get(query.detectTo) || query.detectTo}".`;

    if (query.detectTo === "wyw" || query.detectTo === "yue") {
      userPrompt = `${translationPrompt} to "${
        lang.langMap.get(query.detectTo) || query.detectTo
      }".`;
    }

    if (
      query.detectFrom === "wyw" ||
      query.detectFrom === "zh-Hans" ||
      query.detectFrom === "zh-Hant"
    ) {
      if (query.detectTo === "zh-Hant") {
        userPrompt = `${translationPrompt} to traditional Chinese.`;
      } else if (query.detectTo === "zh-Hans") {
        userPrompt = `${translationPrompt} to simplified Chinese.`;
      } else if (query.detectTo === "yue") {
        userPrompt = `${translationPrompt} to Cantonese.`;
      }
    }
  } else if (mode === "2") {
    userPrompt = `Please polish this sentence without changing its original meaning`;
  } else if (mode === "3") {
    userPrompt = `Please answer the following question`;
  } else if (mode === "4") {
    userPrompt = customizePrompt;
  }
  return userPrompt;
}

function buildRequestBody(model, mode, customizePrompt, query) {
  const prompt = generatePrompts(mode, customizePrompt, query);
  return {
    model: model,
    chat_history: [{ role: "SYSTEM", message: prompt }],
    message: query.text,
    stream: true,
  };
}

function handleGeneralError(query, error) {
  if ("response" in error) {
    // 处理 HTTP 响应错误
    const { statusCode } = error.response;
    const reason = statusCode >= 400 && statusCode < 500 ? "param" : "api";
    query.onCompletion({
      error: {
        type: reason,
        message: `接口响应错误 - ${statusCode}`,
        addition: `${JSON.stringify(error)}`,
      },
    });
  } else {
    // 处理一般错误
    query.onCompletion({
      error: {
        ...error,
        type: error.type || "unknown",
        message: error.message || "Unknown error",
      },
    });
  }
}

function handleStreamResponse(query, targetText, streamData) {
  if (streamData.is_finished === false) {
    const delta = streamData.text;
    if (delta) {
      targetText += delta;
      query.onStream({
        result: {
          from: query.detectFrom,
          to: query.detectTo,
          toParagraphs: [targetText],
        },
      });
    }
  }
  return targetText;
}

function translate(query) {
  if (!lang.langMap.get(query.detectTo)) {
    query.onCompletion({
      error: {
        type: "unsupportLanguage",
        message: "不支持该语种",
        addtion: "不支持该语种",
      },
    });
  }

  const {
    model,
    mode,
    customizePrompt,
    apiUrl,
    apiKey = "https://api.cohere.ai",
  } = $option;
  const apiUrlPath = "/v1/chat";

  const header = buildHeader(apiKey);
  const body = buildRequestBody(model, mode, customizePrompt, query);

  let targetText = ""; // 初始化拼接结果变量
  (async () => {
    await $http.streamRequest({
      method: "POST",
      url: apiUrl + apiUrlPath,
      header,
      body: body,
      cancelSignal: query.cancelSignal,
      streamHandler: (streamData) => {
        if (streamData.text !== undefined) {
          const dataObj = JSON.parse(streamData.text);
          targetText = handleStreamResponse(query, targetText, dataObj);
        }
      },
      handler: (result) => {
        if (result.response.statusCode === 401) {
          handleGeneralError(query, {
            type: "secretKey",
            message: "配置错误 - 请确保您在插件配置中填入了正确的 API Keys",
            addition: "请在插件配置中填写正确的 API Keys",
          });
        } else if (result.response.statusCode >= 400) {
          handleGeneralError(query, result);
        } else {
          query.onCompletion({
            result: {
              from: query.detectFrom,
              to: query.detectTo,
              toParagraphs: [targetText],
            },
          });
        }
      },
    });
  })().catch((err) => {
    handleGeneralError(query, err);
  });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
