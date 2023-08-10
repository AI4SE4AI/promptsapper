import React ,{useState} from "react";
import "./RunStructuredPrompt.css"
import {Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Input } from 'antd';
const { TextArea } = Input;
const User = process.env.PUBLIC_URL + '/user.png';
const SPLSapper = process.env.PUBLIC_URL + '/splsapper.jpg';
const robotBuild = process.env.PUBLIC_URL + '/form.png';

const RunStructuredPrompt = ({system, splJson,  historyRunMessage, handleHistoryChange, handleSavePrompt})=> {
    const initState = {
        historyMessageNum: undefined,
        historyMessage: historyRunMessage,
        prompts: [{role: "system", content: system}],
        question: "",
        loading: false,
        controller: null,
        runPrompt: true,
        isPromptVisible: false
    };
    const [state, setState] = useState(initState);
    state.prompts = [{role: "system", content: system}]

    const addMessage = (text, sender)=> {
        let newHistoryMessage = state.historyMessage;
        if (
            sender !== "assistant" ||
            newHistoryMessage[newHistoryMessage.length - 1].role !== "assistant"
        ) {
            newHistoryMessage = [
                ...state.historyMessage.filter(
                    (v) =>
                        ["system", "user", "assistant"].includes(v.role) && v.content !== ""
                ),
                {role: sender, content: text, time: Date.now()},
            ];
        } else {
            newHistoryMessage[newHistoryMessage.length - 1].content += text;
            setState({...state, historyMessage: newHistoryMessage})
        }
        state.historyMessage = newHistoryMessage;
        handleHistoryChange(newHistoryMessage);
        setState(state);
        setTimeout(() => {
            scrollToBottom(sender !== "assistant");
        }, 0);
    }

    const editMessage = (idx)=> {
        stopStreamFetch();
        const newQuestion = state.historyMessage[idx].content;
        const newHistoryMessage = state.historyMessage.slice(0, idx);
        handleHistoryChange(newHistoryMessage);
        setState({...state, question: newQuestion, historyMessage: newHistoryMessage});
    }

    const stopStreamFetch = () => {
        if (state.controller) {
            state.controller.abort("__ignore");
        }
    };

    const getResponseFormGPT = async (query) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "apiKey": localStorage.getItem('apiKey'),
                "model": "gpt-3.5-turbo",
                "messages": query
            })
        };

        const streamResponse = await fetch('https://www.promptsapper.tech/sappercommunity/chat', requestOptions);
        const reader = streamResponse.body.getReader();
        let errText = "";
        const ENDTEXT = "[DONE]"; // 结束标志，可以根据实际情况进行调整
        const read = () => {
            return reader.read()
                .then(({ done, value }) => {
                    if (done) {
                        return;
                    }
                    const textDecoder = new TextDecoder();
                    let text = "";
                    const strArr = (errText + textDecoder.decode(value)).split("data: ");
                    if (strArr) {
                        for (let i = 0; i < strArr.length; i++) {
                            let json = {};
                            if (strArr[i] && strArr[i].trim() !== ENDTEXT) {
                                try {
                                    json = JSON.parse(strArr[i]);
                                    if (json.choices.length && json.choices[0].delta.content) {
                                        text = text + json.choices[0].delta.content;
                                        addMessage(text, "assistant");
                                    }
                                    errText = "";
                                } catch (e) {
                                    addMessage(json.error.message, "warning");
                                    errText = strArr[i];
                                }

                            }
                        }
                    }
                    return read();
                })
                .catch((error) => {
                    addMessage(error.message, "warning");
                });
        };
        read();
        } catch (error) {
            console.error('Error during fetch:', error);
            addMessage(error.message, "warning");
        }
    };

    const handleSearch = (regenerateFlag)=> {
        const input = state.question;
        if (!regenerateFlag) {
            if (!input) {
                alert("请输入问题");
                return;
            }
            addMessage(input, "user");
            state.question = "";
        }
        setState({...state, loading: true})
        console.log(state.historyMessage)
        const messages = [
            ...state.historyMessage
        ]
            .filter(
                (v) => ["system", "user", "assistant"].includes(v.role) && v.content
            )
            .map((v) => ({role: v.role, content: v.content}))
            .slice(-state.historyMessageNum - 1);

        const prompt = state.prompts
                    .concat(
                        messages
                    )
                    .filter((v) => v)
        getResponseFormGPT(prompt)
    }

    const scrollToBottom = (force = true) =>{
        const dom = document.getElementById("chatbox");
        dom.scrollTo({top: dom.scrollHeight, behavior: "smooth"});
    }

    const target2other = () => {
        let params = new URLSearchParams(window.location.search);
        let key = params.get("sapper"); // 这就是从URL中获取的数据
        console.log(key)
        if(key !== null){
            key = JSON.parse(key)
            const data = {'id': key['posiId'], 'spl': state.prompts[0].content, 'splJson': JSON.stringify(splJson)}
            window.opener.postMessage(JSON.stringify(data), "https://www.promptsapper.tech/sapperpro");
        }
        else {
            handleSavePrompt()
        }
    }

    const handleCopyToClipboard = () => {
    const promptsString = state.prompts[0].content;

    // 使用Clipboard API将内容复制到剪贴板
    navigator.clipboard.writeText(promptsString)
      .then(() => {
        console.log('Prompts copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy prompts to clipboard: ', err);
      });
  };

    return (
        <div className={`d-flex flex-column w-100`}>
            <div id="chatbox" className={`d-flex flex-grow-1 flex-column`}>
                <div className={`d-flex justify-content-between`}>
                    <pre className={`message system-message`} style={{lineHeight: '1.1'}}>
                        <Image
                            alt="logo"
                            src= {SPLSapper}
                            width="35"
                            height="35"
                            className="dialog-portrait-img"
                        />Prompt:
                    <i className={`${state.isPromptVisible ? "fa fa-chevron-circle-up" : "fa fa-chevron-circle-down"}`} onClick={()=>{setState({...state, isPromptVisible: !state.isPromptVisible})}}>
                    </i><br/>{state.isPromptVisible ?  state.prompts[0].content : ''}</pre>
                    <button className={`btn`} style={{height: '40px'}}
                        onClick={handleCopyToClipboard}
                    ><i className="fa fa-clone">Get Prompt
                    </i></button>
                </div>
                <div style={{}}>
                {state.prompts[0].content !== '' && (<button type="button"  className="btn btn-primary" onClick={target2other}
                >Step4: Deploy Prompt</button>)}
                </div>
                <hr/>
                {state.historyMessage.map((msg, idx) => (
                    <div className={`d-flex justify-content-between`} key={msg.time}>
                        <pre className={`message ${msg.role}-message`}><Image
                            alt="logo"
                            src= {msg.role === 'user' ? User : SPLSapper}
                            width="35"
                            height="35"
                            className="dialog-portrait-img"
                        />{msg.content}</pre>
                        {msg.role === "user" ? (
                            <div
                                onClick={() => editMessage(idx)}
                            ><i className="fa fa-edit">
                            </i></div>
                        ) : (
                            ""
                        )}
                    </div>
                ))}
                {state.loading ? (
                    <p className="loading_wrap">AI is thinking...</p>
                ) : (
                    ""
                )}
            </div>

            {state.runPrompt && <div id="input-container" className={`d-flex flex-column justify-content-end`} style={{
                backgroundColor: 'white',
                boxSizing: 'border-box',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                borderRight: '1px solid gray',
                borderLeft: '1px solid gray'
            }}>
            <TextArea
                id="inputbox"
                placeholder="Enter your question here and click Enter+Shift to send it"
                value={state.question}
                style={{
                    fontSize: '18px',
                    borderRadius: '8px',
                    }}
                bordered={false}
                autoSize={{
                  maxRows: 10,
                  minRows: 2
                }}
                onChange={(e) => setState({...state, question: e.target.value})}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      handleSearch();
                    }
                }}
            >
            </TextArea>
            <button style={{alignSelf: 'flex-end'}} onClick={() => handleSearch()}><i className="fa fa-send">
            </i></button>
            </div>
            }
        </div>
  );
}
export default RunStructuredPrompt;
