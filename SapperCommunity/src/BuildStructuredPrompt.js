import React, { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import Form from './Form';
import {Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import './BuildStructuredPrompt.css'
import AddStructuredPrompt from "./AddStructuredPrompt";
import RunStructuredPrompt from "./RunStructuredPrompt"
import {Steps } from 'antd';
import Draggable from 'react-draggable';

const decompiler = `
You are a decompiler.

Your task is to convert semi-structured description into natural language format.

The information I will give you:
Semi-structured description: a prompt in semi-structured format.
Requirements:
1. You can only give me the natural language format of the input.
2. The given natural language content should have strong logic and maintain semantic consistency.
3. You can't leave out any information in the semi-structured description.
4. You must follow the sequence of information in the semi-structured prompt, top-down, into natural language form.
5. The output natural language needs to end with '.' Line break.
 `
const BNFDecompiler = `
Pattern:
Json format: <The json format of the basic information of the project>
Semi-structured format: <The semi-structured format of the basic information of the project>
==================================================
Sample:
Json format:
[
    {
      "id": 1,
      "annotationType": "Persona",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content": "You are a creative NPC creator"
        }
      ]
    },
    {
      "id": 2,
      "annotationType": "Audience",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content": "Children at age 6-12"
        }
      ]
    },
    {
      id: 3,
      annotationType: "Terminology",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Terms",
            "content": ["weapons: sword, axe, mace, spear, bow, crossbow, carrot, balloon"]
        }
      ]
    },
    {
      "id": 4,
      "annotationType": 'Instruction',
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Commands",
            "content": ["wait for the user to enter NPC description","create a NPC profile for an RPG game in JSON format based on the input NPC description"]
        },
        {
            "sectionId": "S2",
            "sectionType": "Rules",
            "content": ["name, age, armor and items must be appropriate for the target audience", "armor must be in weapons"]
        },
        {
            "sectionId": "S3",
            "sectionType": "Format",
            content: " description : <NPC description>,\\n" +
              "            name : <NPC name>,\\n" +
              "            age : <NPC age>,\\n" +
              "            armor : <select one from weapons>,\\n" +
              "            items : <three items appropriate for this NPC>,"
        }
      ]
    }
]
Semantic format:
NPC Creator {
    @persona {
        You are a creative NPC creator;
    }

    @audience {
        Children at age 6-12;
    }

    @terminology {
        weapons = "sword, axe, mace, spear, bow, crossbow, carrot, balloon";
    }

    @instruction NPC Profile Creator {
        @command {
            wait for the user to enter NPC description;
            create a NPC profile for an RPG game in JSON format based on the input NPC description;
        }

        @rule name, age, armor and items must be appropriate for the target audience;
        @rule armor must be in weapons;

        @format NPC profile {
            @rule age must be number;
            @rule If no weapon is selected, explain why;

            description : <NPC description>,
            name : <NPC name>,
            age : <NPC age>,
            armor : <select one from weapons>,
            items : <three items appropriate for this NPC>,
        }
    }
}
==================================================
 `

const compiler = `
Semi-structured description BNF:
    structured-prompt :: [priming] <structured-prompt-part> {structured-prompt-part}

    structured-prompt-part :: [identifier] [left-bracket] <structured-prompt-body> [right-bracket]

    structured-prompt-body :: {metadata-part}
                               {context-part}
                               {instruction-part}

    metadata-part :: <@metadata> [identifier] <left-bracket> <metadata-prompt> <right-bracket>

    metadata-prompt :: {comment-part} <nldesc>

    context-part ::= [persona-part] [audience-part] {terminology-part} {context-control-part}

    persona-part ::= <@persona> [identifer] <left-bracket> <persona-prompt> <right-bracket>

    persona-prompt ::= {comment-part} {rule-part} <nldesc>

    audience-part ::= <@audience> [identifier] <left-bracket> <audience-prompt> <right-bracket>

    audience-prompt ::= {comment-part} {rule-part} <nldesc>

    terminology-part ::= <@terminology> [identifier] <left-bracket> <terminology-prompt> <right-bracket>

    terminology-prompt ::= {comment-part} {rule-part} <desc>

    context-control-part ::= <@context-control> [identifier] <left-bracket> <context-control-prompt> <right-bracket>

    context-control-prompt ::= {comment-part} {rule-part} <desc>

    instruction-part ::= <@instruction> [@worker-stereotype-name] [identifier] <left-bracket> <instruction-prompt> <right-bracket>

    instruction-prompt ::= {comment-part} {parameter-part} {rule-part} {command-part} {reflection-part} {format-part} {example-part}

    comment-part ::= <@comment> [left-bracket] <comment-prompt> [right-bracket]

    comment-prompt ::= [index] <nldesc>

    rule-part ::= <@rule> [@paradigm-name] [left-bracket] <rule-prompt> [right-bracket]

    rule-prompt ::= [index] <desc>

    parameter-part ::= <@parameter> [left-bracket] <parameter-prompt> [right-bracket]

    parameter-prompt ::= [index] <def-value>

    command-part ::= <@command> [@paradigm-name] [@think-aloud] [left-bracket] <command-prompt> [right-bracket]

    command-prompt ::= [index] <desc>

    format-part ::= <@format> [identifier] [left-bracket] {comment-part} {rule-part} <format-prompt> [right-bracket]

    format-prompt ::= [index] <desc>

    example-part ::= <@example> [left-bracket] {comment-part} <example-prompt> [right-bracket]

    example-prompt ::= [example-context] [index] [@input] <desc> <separator> [@output] <desc>

    example-context ::= <desc>

    desc ::= nldesc | code | equation

    def-value ::= identifier assign value | identifier assign left-bracket value-tuple right-bracket
                    | identifier-tuple assign value-tuple | identifier-tuple assign left-bracket value-tuple-list right-bracket

    identifier-tuple ::= <identifier>

    value-tuple ::= <value>

    value-tuple-list ::= <value-tuple>
====================================================================================================
Pattern:
Natural language description:
[Natural language descriptions of tasks]
Semi-structured description:
    [Identifier] {
        @metadata [identifier] {
            @comment {
                body
            }
            nldesc
        }
        @persona [identifier] {
            @comment {
                body
            }
            @rule [@paradigm-name] {
                body
            }
            nldesc
        }

        @audience [identifier] {
            @comment {
                body
            }
            @rule [@paradigm-name] {
                body
            }
            nldesc
        }

        @terminology [identifier] {
            @comment {
                body
            }
            @rule [@paradigm-name] {
                body
            }
            desc
            |
            def-value
            desc
        }

        @context-control [identifier] {
            @comment {
                body
            }
            @rule [@paradigm-name] {
                body
            }
            desc
            |
            def-value
            desc
        }

        @instruction [identifier] {
            @comment {
                body
            }
            @rule [@paradigm-name] {
                body
            }
            @command [@paradigm-name] [@think-aloud] {
                body
            }
            @format [identifier] {
                body
            }
            @example {
                body
            }
        }
    }
====================================================================================================
Sample:
Natural language description:
[As a creative NPC creator, your audience is children between the ages of 6 and 12. The weapons terminology includes sword, axe, mace, spear, bow, crossbow, carrot, and balloon. 
You need to create an NPC profile for an RPG game in JSON format based on the user's input NPC description. The NPC's name, age, armor, and items must be appropriate for the target audience. 
The armor must be chosen from the weapons terminology. The NPC profile format includes rules that state the age must be a number and if no weapon is selected, an explanation must be provided as to why. 
The NPC profile includes the NPC description, name, age, armor (selected from the weapons terminology), and three items appropriate for the NPC.]
Semi-structured description:
    NPC Creator {
        @persona {
            You are a creative NPC creator;
        }

        @audience {
            Children at age 6-12;
        }

        @terminology {
            weapons = "sword, axe, mace, spear, bow, crossbow, carrot, balloon";
        }

        @instruction NPC Profile Creator {
            @command {
                wait for the user to enter NPC description;
                create a NPC profile for an RPG game in JSON format based on the input NPC description;
            }

            @rule name, age, armor and items must be appropriate for the target audience;
            @rule armor must be in weapons;

            @format NPC profile {
                @rule age must be number;
                @rule If no weapon is selected, explain why;

                description : <NPC description>,
                name : <NPC name>,
                age : <NPC age>,
                armor : <select one from weapons>,
                items : <three items appropriate for this NPC>,
            }
        }
    }
====================================================================================================
`
const BNFCompiler = `
Pattern:
Semi-structured format: <The semi-structured format of the basic information of the project>
Json format: <The json format of the basic information of the project>
[
    {
      "id": 1,
      "annotationType": "Metadata",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content":
        },
        {
            "sectionId": "S2",
            "sectionType": "Comment",
            "content":
        },
        {
            "sectionId": "S3",
            "sectionType": "Rules",
            "content": []
        }
      ]
    },
    {
      "id": 2,
      "annotationType": "Persona",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content":
        },
        {
            "sectionId": "S2",
            "sectionType": "Comment",
            "content":
        },
        {
            "sectionId": "S3",
            "sectionType": "Rules",
            "content": []
        }
      ]
    },
    {
      "id": 3,
      "annotationType": "Audience",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content":
        },
        {
            "sectionId": "S2",
            "sectionType": "Comment",
            "content":
        },
        {
            "sectionId": "S3",
            "sectionType": "Rules",
            "content": []
        }
      ]
    },
    {
      "id": 4,
      "annotationType": 'Terminology',
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content":
        },
        {
            "sectionId": "S2",
            "sectionType": "Comment",
            "content":
        },
        {
            "sectionId": "S3",
            "sectionType": "Terms",
            "content": []
        },
        {
            "sectionId": "S4",
            "sectionType": "Rules",
            "content": []
        }
      ]
    },
    {
      "id": 5,
      "annotationType": 'ContextControl',
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content":
        },
        {
            "sectionId": "S2",
            "sectionType": "Comment",
            "content":
        },
        {
            "sectionId": "S3",
            "sectionType": "Rules",
            "content": []
        }
      ]
    }
    {
      "id": 6,
      "annotationType": 'Instruction',
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content":
        },
        {
            "sectionId": "S2",
            "sectionType": "Comment",
            "content":
        },
        {
            "sectionId": "S3",
            "sectionType": "Commands",
            "content": []
        },
        {
            "sectionId": "S4",
            "sectionType": "Rules",
            "content": []
        },
        {
            "sectionId": "S5",
            "sectionType": "Terms",
            "content": []
        },
        {
            "sectionId": "S6",
            "sectionType": "Format",
            "content": 
        },
        {
            "sectionId": "S7",
            "sectionType": "Example",
            "content": {"input": "", "output": ""}
        }
      ]
    }
]
==================================================
Sample:
Semi-structured format:
NPC Creator {
    @persona {
        You are a creative NPC creator;
    }

    @audience {
        Children at age 6-12;
    }

    @terminology {
        weapons = "sword, axe, mace, spear, bow, crossbow, carrot, balloon";
    }

    @instruction NPC Profile Creator {
        @command {
            wait for the user to enter NPC description;
            create a NPC profile for an RPG game in JSON format based on the input NPC description;
        }

        @rule name, age, armor and items must be appropriate for the target audience;
        @rule armor must be in weapons;

        @format NPC profile {
            @rule age must be number;
            @rule If no weapon is selected, explain why;

            description : <NPC description>,
            name : <NPC name>,
            age : <NPC age>,
            armor : <select one from weapons>,
            items : <three items appropriate for this NPC>,
        }
    }
}
Json format:
[
    {
      "id": 1,
      "annotationType": "Persona",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content": "You are a creative NPC creator"
        }
      ]
    },
    {
      "id": 2,
      "annotationType": "Audience",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Description",
            "content": "Children at age 6-12"
        }
      ]
    },
    {
      id: 3,
      annotationType: "Terminology",
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Terms",
            "content": ["weapons: sword, axe, mace, spear, bow, crossbow, carrot, balloon"]
        }
      ]
    },
    {
      "id": 4,
      "annotationType": 'Instruction',
      "section": [
        {
            "sectionId": "S1",
            "sectionType": "Commands",
            "content": ["wait for the user to enter NPC description","create a NPC profile for an RPG game in JSON format based on the input NPC description"]
        },
        {
            "sectionId": "S2",
            "sectionType": "Rules",
            "content": ["name, age, armor and items must be appropriate for the target audience", "armor must be in weapons"]
        },
        {
            "sectionId": "S3",
            "sectionType": "Format",
            content: " description : <NPC description>,\\n            name : <NPC name>,\\n            age : <NPC age>,\\n            armor : <select one from weapons>,\\n            items : <three items appropriate for this NPC>,"
        }
      ]
    }
]
==================================================
annotationType can only be selected from the following list [Metadata, Persona, Audience, Terminology, ContextControl, Instruction].
The format of "rules", "terms" and "command" is ["", ""]
Please output in strict JSON format.
`

function BuildStructuredPrompt() {
  const data =  [];
  const [fields, setFields] = useState(data);

  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const initState = {
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: '',
      model: "gpt-3.5-turbo-16k",
      temperature: 0.3,
      max_tokens: 3000,
      overTime: 30000,
      historyMessageNum: undefined,
      historyMessage: [],
      historyNLMessage: '',
      historySPLMessage: '',
      prompts: [{ role: "system", content: decompiler }],
      nextPrompts: [],
      question: '',
      loading: false,
      CompilerLoading: false,
      DecompilerLoading: false,
      controller: null,
      promptName :'',
      isTextEdit: false,
      isPage: 0,
      PageInfo: [['Generate', 'Provide the basic prompt information'], ['Refine', 'Edit the structured prompt'], ['Run', 'Run or Export the Prompt you create'], ['Export', '']],
      historyRunMessage: []
  };

  const [state, setState] = useState(initState)

  useEffect(() => {
    // 从 URL 中解析数据
    const receivedData = query.get('SPLId');
    // 处理数据，并更新页面
    if(receivedData !== null) {
        fetch('https://www.aichain.store/sapper_get_spl', {
            method: 'POST', // 请求方法（GET、POST、PUT、DELETE等）
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // 要发送的数据
                SPLId: receivedData,
            })
        })
            .then(response => response.json()) // 解析响应数据为 JSON
            .then(data => {
                // 处理响应数据
                setFields(data.spl_data['JsonDate']);
                setNldes(data.spl_data['NLDesc']);
                setSPLdes(data.spl_prompt)
                setState({...state, isPage: 1})
            })
            .catch(error => {
                // 处理错误
                setFields([]);
            });
    }
    let params = new URLSearchParams(window.location.search);
        let receivespl = params.get("sapper"); // 这就是从URL中获取的数据
    if(receivespl !== null){
        let spl = JSON.parse(receivespl)['spl']
        if(spl !== ''){
            setFields(JSON.parse(spl));
           setState({...state, isPage: 1})
        }
        let key = JSON.parse(receivespl)['key']
        if(key !== ''){
            localStorage.setItem('apiKey', key)
            state.apiKey = key;
        }
    }
    if(state.apiKey === '' && localStorage.getItem("apiKey")){
        state.apiKey = localStorage.getItem("apiKey")
        // state.apiKey = prompt("Please input your Openai API key here", state.apiKey) || state.apiKey
    }
      }, [location.search]);


  let [nldes, setNldes] = useState('');
  let [spldes, setSPLdes] = useState('');

  const SetGPTKey = () =>{
      const apiKey = prompt("Please input your Openai API key here", state.apiKey)
      if(apiKey !== null){
          state.apiKey = apiKey;
          localStorage.setItem("apiKey", apiKey);
      }
  }
  let [warnData, setWarnData] = useState([]);
  const jsontoSPL = ()=>{
      let SPL = ''
      fields.forEach((field) => {
          const newField = {...field};
          const identifier = field.section.filter((section)=>(section.sectionType === 'Name'))
          const example = field.section.filter((section)=>(section.sectionType === 'Example'))

          const exampleSPL = example.length !== 0 ? example.map((exam)=>(
            `\t@example{\n\t\t@Input{\n\t\t\t${exam.content['input'].split('\n').join("\n\t\t\t")}\n\t\t}\n\t\t@Output{\n\t\t\t${exam.content['output'].split('\n').join("\n\t\t\t")}\n\t\t}\n\t}\n`)) : '';

          newField.section = field.section.filter((section)=>(section.sectionType !== 'Name'))
          newField.section = newField.section.filter((section)=>(section.sectionType !== 'Example'))
          let SectionSPL = ''
          SectionSPL = newField.section.map((section)=>(Array.isArray(section.content) ? section.content.map((content)=>(
                `\t@${section.sectionType} ${content.split("\n").join("\n\t\t")}`)).join('\n') + `\n`
            : `\t@${section.sectionType}{\n\t\t${section.content.split("\n").join("\n\t\t")}\n\t}`)).join('\n');

          SPL += `@${newField.annotationType} ${identifier.length !==0 ? identifier[0].content : ''}{\n${SectionSPL}\n${example.length !==0 ? exampleSPL : ''}\n}\n`
      })
      SPL = "@Priming \"I will provide you the instructions to solve problems. The instructions will be written in a semi-structured format. You should executing all instructions as needed\"\n" +
          state.promptName + "{\n\t" + SPL.split("\n").join("\n\t") + "\n}"
      setSPLdes(SPL);
      return SPL
  }

  const checkData = () => {
      let exitAnnotation = [];
      const updatedFields = fields.map((field) => {
        exitAnnotation.push(field.annotationType);
        const checkSection = ['Rules', 'Terms', 'Commands'];  // assume you want different items
        field.section = field.section.filter((section) => !(checkSection.includes(section.sectionType) && section.content.length === 0));
        return field;
      })
      const updatedWarning = []
      if(!exitAnnotation.includes('Instruction')){
          updatedWarning.push("Suggest adding Instruction");
      }
      if(exitAnnotation.includes('Persona') && ! exitAnnotation.includes('Audience')){
          updatedWarning.push("Suggest adding Audience");
      }
      if(exitAnnotation.includes('Audience') && ! exitAnnotation.includes('Persona')){
          updatedWarning.push("Suggest adding Persona");
      }
      const fieldsChanged = JSON.stringify(updatedFields) !== JSON.stringify(fields); // 进行浅比较检查 updatedFields 是否发生了变化
      const warnsChanged = JSON.stringify(updatedWarning) !== JSON.stringify(warnData); // 进行浅比较检查 updatedFields 是否发生了变化
      if(warnsChanged){
          setWarnData(updatedWarning);
      }
      if (fieldsChanged) {
        setFields(updatedFields);
      }
  };
  checkData();

  const handleDataChange = (updatedFields) => {
    setFields(updatedFields);
  }

  const addMessage=(text, sender)=>{
      let historyMessage = state.historyMessage;
      if (
        sender !== "assistant" ||
        historyMessage[historyMessage.length - 1].role !== "assistant"
      ) {
        historyMessage = [
          ...state.historyMessage.filter(
            (v) =>
              ["system", "user", "assistant"].includes(v.role) && v.content !== ""
          ),
          { role: sender, content: text, time: Date.now() },
        ];
      } else {
        historyMessage[historyMessage.length - 1].content += text;
      }

      state.historyMessage = historyMessage;
      setState(state);
  }

  const getResponseFromAPI = async (text)=> {
      const controller = new AbortController();
      state.controller = controller;
      const signal = controller.signal;
      const timeout = setTimeout(() => {
        controller.abort();
      }, state.overTime);

      const messages = [{ role: "user", content: text }];
      const requestOptions = {
            signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "apiKey": localStorage.getItem('apiKey'),
                "model": "gpt-3.5-turbo",
                "messages": state.prompts
            .concat(
              messages,
              state.nextPrompts.length ? state.nextPrompts : []
            )
            .filter((v) => v)
            })
        };
      const response = await fetch('https://www.promptsapper.tech/sappercommunity/chat', requestOptions);
      clearTimeout(timeout);
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message || error.code);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const stream = new ReadableStream({
        start(controller) {
          return pump();
          function pump() {
            return reader.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                return;
              }
              let text = "";
              const str = decoder.decode(value);
              const strs = str.split("data: ").filter((v) => v);
              for (let i = 0; i < strs.length; i++) {
                const val = strs[i];
                if (val.includes("[DONE]")) {
                  controller.close();
                  return;
                }
                const data = JSON.parse(val);
                data.choices[0].delta.content &&
                  (text += data.choices[0].delta.content);
              }
              controller.enqueue(text);
              return pump();
            });
          }
        },
      });
      return new Response(stream);
  }

  const handleCompiler = (regenerateFlag) =>{
      jsontoSPL()
      state.prompts = [{ role: "system", content: compiler }]
      state.question = "Natural language description: \n" + nldes + 'Semi-structured description:\n';
      const input = state.question;
      if (!regenerateFlag) {
        if (!input) {
          alert("请输入问题");
          return;
        }
        addMessage(input, "user");
      }
      setState({...state, CompilerLoading: true})
      if(state.historyNLMessage !== '' && state.historySPLMessage !== null){
          fetch('https://www.aichain.store/nl2spl', {
            method: 'POST', // 请求方法（GET、POST、PUT、DELETE等）
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // 要发送的数据
                oldSPL: spldes,
                oldNL: state.historyNLMessage,
                newNL: nldes,
                apiKey: localStorage.getItem('apiKey')
            })
        })
        .then(response => response.json()) // 解析响应数据为 JSON
        .then(data => {
            // 处理响应数据
            console.log(data.data)
            // setNldes(data.data)
            setFields(data.data)
            state.historySPLMessage = [...fields]
            setState({...state, historyNLMessage: nldes, CompilerLoading: false})
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
      }
      else {
          // 使用 OpenAI API 获取 ChatGPT 的回答
          getResponseFromAPI(input)
              .then(async (response) => {
                  if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error);
                  }
                  const data = response.body;
                  if (!data) throw new Error("No data");
                  nldes = '';
                  const reader = data.getReader();
                  let done = false;
                  let BNFnldes = '';
                  while (!done) {
                      const {value, done: readerDone} = await reader.read();
                      if (value) {
                          BNFnldes += value;
                          addMessage(value, "assistant");
                      }
                      done = readerDone;
                  }
                  state.prompts = [{role: "system", content: BNFCompiler}]
                  state.question = "Semi-structured format: \n" + BNFnldes + 'Json format:\n';
                  const input = state.question;
                  getResponseFromAPI(input)
                      .then(async (response) => {
                          if (!response.ok) {
                              const error = await response.json();
                              throw new Error(error.error);
                          }
                          const data = response.body;
                          if (!data) throw new Error("No data");
                          nldes = '';
                          const reader = data.getReader();
                          let done = false;
                          while (!done) {
                              const {value, done: readerDone} = await reader.read();
                              if (value) {
                                  nldes += value;
                                  addMessage(value, "assistant");
                              }
                              done = readerDone;
                          }
                          handleDataChange(JSON.parse(nldes));

                      })
                      .catch((error) => {
                          if (state.controller && state.controller.signal.reason === "__ignore") {
                              return;
                          }
                          console.log('-------------error', state.controller.signal, state.controller.signal.reason, error, error.name, error.message);
                          nldes += error.message;
                          addMessage(
                              error.name === "AbortError" ? "Network Error" : error.message,
                              "warning"
                          );
                      })
              })
              .catch((error) => {
                  if (state.controller && state.controller.signal.reason === "__ignore") {
                      return;
                  }
                  console.log('-------------error', state.controller.signal, state.controller.signal.reason, error, error.name, error.message);
                  nldes += error.message;
                  addMessage(
                      error.name === "AbortError" ? "Network Error" : error.message,
                      "warning"
                  );
                  state.historyNLMessage = nldes
                  setState({...state, historyNLMessage: nldes, CompilerLoading: false})
              })
              .finally(() => {
                  setState({...state, historyNLMessage: nldes, CompilerLoading: false})
              });
      }
  }

  const handleDeompiler = (regenerateFlag) =>{
      let SPL = jsontoSPL()
      state.prompts = [{ role: "system", content: BNFDecompiler }]
      state.question = "Json format: \n" + JSON.stringify(fields) + 'Semantic format:\n';
      const input = state.question;
      if (!regenerateFlag) {
        if (!input) {
          alert("请输入问题");
          return;
        }
        addMessage(input, "user");
      }
      setState({...state, DecompilerLoading: true})
      if(state.historyNLMessage !== '' && state.historySPLMessage !== null){
          const historySPLMessage = [...state.historySPLMessage];
          let changeField = [];
          let updateField = [];
          fields.forEach((field)=> {
              const historyField = historySPLMessage.filter((Message) => Message.id === field.id)
              if(JSON.stringify(field) !== JSON.stringify(historyField[0])){
                  changeField.push(historyField[0]);
                  updateField.push(field);
              }
          });

          let changeSection = [];
          let updateSection = [];
          if(changeField.length === 0){
              setState({...state, DecompilerLoading: false})
              return;
          }
          updateField[0].section.forEach((section)=> {
              const historySection = changeField[0].section.filter((Message) => Message.sectionId === section.sectionId)
              if(JSON.stringify(section) !== JSON.stringify(historySection[0])){
                  changeSection.push(historySection[0]);
                  updateSection.push(section);
              }
          });


          console.log(changeSection)
          console.log(updateSection)
          if(changeSection.length === 0){
              setState({...state, DecompilerLoading: false})
              return;
          }
          let changeSPL=''
          let updateSPL=''
          if(Array.isArray(changeSection[0].content) && changeSection[0].content.length === updateSection[0].content.length){
              let changeItem = [];
              let updateItem = [];
              updateSection[0].content.forEach((Item, index)=> {
                  if(changeSection[0].content[index] !== Item){
                      changeItem.push(changeSection[0].content[index]);
                      updateItem.push(Item);
                  }
              });
              changeSPL = "@" + changeSection[0].sectionType + " {\n" + changeItem[0] + "\n}"
              updateSPL = "@" + updateSection[0].sectionType + " {\n" + updateItem[0] + "\n}"
          }
          else{
              changeSPL = "@" + changeSection[0].sectionType + " {\n" + changeSection[0].content + "\n}"
              updateSPL = "@" + updateSection[0].sectionType + " {\n" + updateSection[0].content + "\n}"
          }
          fetch('https://www.promptsapper.tech/sappercommunity/sapperchian/sapperSpl2nl', {
            method: 'POST', // 请求方法（GET、POST、PUT、DELETE等）
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // 要发送的数据
                NL: nldes,
                oldSPL: changeSPL,
                newSPL: updateSPL,
                apiKey: localStorage.getItem('apiKey')
            })
        })
        .then(response => response.json()) // 解析响应数据为 JSON
        .then(data => {
            // 处理响应数据
            console.log(data.data)
            setNldes(data.data)
            state.historyNLMessage = data.data
            setState({...state, historySPLMessage: [...fields], DecompilerLoading: false})
            // console.log(state.historyNLMessage)
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
      }
      else {
      SPL = jsontoSPL()
      state.prompts = [{role: "system", content: decompiler}]
          console.log(SPL)
      state.question = "Semi-structured description: \n" + SPL + 'natural language format:\n';
      const input = state.question;
      getResponseFromAPI(input)
          .then(async (response) => {
              if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error);
              }
              const data = response.body;
              if (!data) throw new Error("No data");
              nldes = '';
              const reader = data.getReader();
              let done = false;
              while (!done) {
                  const {value, done: readerDone} = await reader.read();
                  if (value) {
                      nldes += value;
                      setNldes(nldes);
                      addMessage(value, "assistant");
                      // scrollToBottom();
                  }
                  done = readerDone;
              }
              state.historySPLMessage = [...fields];
              state.historyNLMessage = nldes;
              setState(state)
              jsontoSPL()
          })
          .catch((error) => {
              if (state.controller && state.controller.signal.reason === "__ignore") {
                  return;
              }
              console.log('-------------error', state.controller.signal, state.controller.signal.reason, error, error.name, error.message);
              nldes += error.message;
              setNldes(nldes);
              addMessage(
                  error.name === "AbortError" ? "Network Error" : error.message,
                  "warning"
              );
          })
          .finally(()=>{
              setState({...state, DecompilerLoading: false})
              jsontoSPL()
          })
      }
  }

  const handleRun = () =>{
      jsontoSPL();
      setState({...state, isPage: 2})
  }

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
        let text = ""; // Variable to store the response text
        const read = () => {
            return reader.read()
                .then(({ done, value }) => {
                    if (done) {
                        return text; // Resolve the promise with the final text value
                    }
                    const textDecoder = new TextDecoder();
                    const strArr = (errText + textDecoder.decode(value)).split("data: ");
                    if (strArr) {
                        for (let i = 0; i < strArr.length; i++) {
                            let json = {};
                            if (strArr[i] && strArr[i].trim() !== ENDTEXT) {
                                try {
                                    json = JSON.parse(strArr[i]);
                                    if (json.choices.length && json.choices[0].delta.content) {
                                        text = text + json.choices[0].delta.content;
                                    }
                                    errText = "";
                                } catch (e) {
                                    window.alert(json.error.message, "warning");
                                    errText = strArr[i];
                                }

                            }
                        }
                    }
                    return read();
                })
                .catch((error) => {
                    window.alert(error.message, "warning");
                });
        };
        return read(); // Return the promise that resolves with the final text value
    }
        catch (error) {
            console.error('Error during fetch:', error);
            window.alert(error.message, "warning");
            return ""; // Return an empty string in case of an error
        }
    };

  const fetchData= async ()=> {
        let result = ''
        try {
            const completion = await getResponseFormGPT([{role: "system", content: 'you are a helpful system'}, {
                    role: "user",
                    content: spldes + '\n\nSummarize in one sentence what the above AI service does and what to input.'
                }]);
            console.log(completion)
            result = completion;

        } catch (error) {
            console.error('Invalid JSON string in location.state.result:', error);
        }
        fetch('https://www.aichain.store/sapper_spl', {
            method: 'POST', // 请求方法（GET、POST、PUT、DELETE等）
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // 要发送的数据
                SPLId: query.get('SPLId') !== null ? query.get('SPLId'): '',
                spl_prompt: spldes,
                spl_data: {"JsonDate": fields, "NLDesc": nldes, "SPLName": state.promptName, "SPLPreInfo": result}
            })
        })
        .then(response => response.json()) // 解析响应数据为 JSON
        .then(async data => {
            // 处理响应数据
            if (data.hasOwnProperty('url')) {
                window.open(data.url)
                setState({...state, isPage: 3})
                alert('success')
            }
            if (data.hasOwnProperty('code') && data.code === 200) {
                setState({...state, isPage: 3})
                alert("success");
            }
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
  }

  const handlePromptSave = ()=>{
    fetchData();
  }

  const SPLItemBar = () => {
      const SPLItems = [];
      const [SPLItem, SetSPLItem] = useState(SPLItems);

      const [active, setActive] = useState(1);
      let itemsButton = [];

      for (let number = 1; number <= SPLItem.length; number++) {
        itemsButton.push(
          <button type="button" className={number === active ? `btn btn-light` : `btn`} key={number} onClick={() => setActive(number)} style={{borderRight: '1px solid white'}}>
            {SPLItem[number - 1]}
          </button>,
        );
      }

      return (
        <div className="d-flex" style={{backgroundColor: '#e2ebf0', padding: '2px'}}>
          <div className="btn-group btn-group-sm">{itemsButton}</div>
        </div>
      );
  }

  const StepProgressBar = () => {

  return (
      <Steps
        type="navigation"
        current={state.isPage}
        className="site-navigation-steps"
        style={{padding: '0'}}
        size={"small"}
        items={[
          {
            title: 'Generate Prompt',
          },
          {
            title: 'Refine Prompt',
          },
          {
            title: 'Run Prompt',
          },
          {
            title: 'Export Prompt',
          },
        ]}
      />
  );
  }
  const initFiller = {loading: false, question: '', message: [{role: "assistant", content: "Hello, I am an auxiliary filling robot. I can provide you with four services:\n1. Explanation and Q&A of Form Terms \n2. Recommendation of Common Use Cases\n3. Recommendation for filling in the form of requirement changes \n4. Check and reflect on the filling results \nPlease enter the service number you want:\n"}], show: false, flag : '0'}
  const [filler, setFiller] = useState(initFiller);
  const User = process.env.PUBLIC_URL + '/user.png';
  const SPLSapper = process.env.PUBLIC_URL + '/splsapper.jpg';
  const handleFiller = ()=> {
        filler.message.push({role: "user", content: filler.question})
        const query = filler.question
        setFiller({...filler, loading: true, question: ''})
        fetch('https://www.aichain.store/formFiller', {
            method: 'POST', // 请求方法（GET、POST、PUT、DELETE等）
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // 要发送的数据
                query : query,
                form : JSON.stringify(fields),
                flag : filler.flag,
                apiKey: localStorage.getItem('apiKey')
            })
        })
        .then(response => response.json()) // 解析响应数据为 JSON
        .then(data => {
            data = data.data
            filler.message.push({role: "assistant", content: data.context})
            filler.flag = data.flag
        })
        .catch(error => {
            // 处理错误
            console.error(error);

        })
        .finally(()=>{
            setFiller({...filler, loading: false, question: ''})
        });
    }
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, ui) => {
    const { x, y } = ui;
    const { offsetWidth, offsetHeight } = e.target;
    const { innerWidth, innerHeight } = window;

    const maxX = innerWidth - offsetWidth;
    const maxY = innerHeight - offsetHeight;

    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setPosition({ x: boundedX, y: boundedY });
  };
  const handleFillerShow = () => {
        setFiller({...filler, show: !filler.show})
  }


  return (
    <div className="d-flex flex-column WorkPage" style={{position: "relative"}}>
      <div className={`d-flex`}>
          <StepProgressBar/>
          <div onClick={SetGPTKey}>
              <i className={`fa fa-key`} style={{paddingRight: '2px'}}>key</i>
          </div>
        </div>
      <div className={`d-flex justify-content-between align-items-center`}>
        <div>
            {state.isPage !== 0 && (
                <span>
                    <i
                        className={`fa fa-arrow-circle-o-left`}
                        onClick={() => setState({...state, isPage: state.isPage !== 0 ? state.isPage-1 : 0})}
                        style={{paddingRight: '2px', paddingLeft: '2px', fontSize: '20px'}}
                    />{'Back to ' + state.PageInfo[state.isPage-1][0]}
                </span>
            )}
        </div>
        <div className={`d-flex flex-column`} style={{paddingRight: '50px'}}>
            <div>{state.PageInfo[state.isPage][1]}</div>
        </div>
        <div>
            {state.isPage !== 2 && state.isPage !== 3 && (
                <span>
                    {'Go to ' + state.PageInfo[state.isPage+1][0]}
                    <i
                        className={`fa fa-arrow-circle-o-right`}
                        onClick={() => setState({...state, isPage: state.isPage !==2 ? state.isPage+1 : 2})}
                        style={{paddingRight: '2px', paddingLeft: '2px', fontSize: '20px'}}
                    />
                </span>
            )}
        </div>
      </div>

      <div id="AddPromptPage" className={`PromptPage w-100 overflow-hidden ${state.isPage === 0 ? 'flex-grow-1' : 'collapse'}`}>
         <AddStructuredPrompt handleFieldChange={(fields)=>{setFields(fields);}} handleStateChange={(page) =>{setState({...state, isPage: page})}} handleNameChange={(page) =>{setState({...state, promptName: page})}}/>
      </div>
      <div id='BuildPromptPage' className={`PromptPage w-100 overflow-hidden ${state.isPage === 1 ? 'flex-grow-1' : 'collapse'}`}>

            <div id="FormFiller" className={`${filler.show ? '' : 'collapse'}`} style={{ position: 'absolute', top: '80px' , left: '50%', zIndex: '1001', padding: '5px',backgroundColor: '#cfd9df', border: '1px solid gray', height: '75vh', width: '60vh'}}>
                <div className={'d-flex flex-column h-100'}>
                <div className={`d-flex justify-content-center`} style={{margin: '2px', borderBottom: '1px solid black'}}>
                    Form Copilot
                </div>
                <div className={`flex-grow-1 d-flex flex-column`} style={{overflowY: 'scroll'}}>
                    {filler.message.map((msg, idx) => (
                        <div className={`d-flex justify-content-between`} key={msg.time}>
                            <pre className={`message ${msg.role}-message`}><Image
                                alt="logo"
                                src= {msg.role === 'user' ? User : SPLSapper}
                                width="35"
                                height="35"
                                className="dialog-portrait-img"
                            />{msg.content}</pre>
                        </div>
                    ))}
                    {filler.loading ? (
                        <p className="loading_wrap">AI is thinking...</p>
                    ) : (
                        ""
                    )}
                </div>
                <div className={`d-flex flex-column justify-content-end`} style={{
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                        borderRadius: "8px",
                        height: '120px'
                    }}>
                    <textarea
                        id="FillerValue"
                        placeholder="click Enter+Shift to send your question"
                        value={filler.question}
                        style={{
                            resize: 'none',
                            border: '0',
                            outline: 'none',
                            padding: '10px',
                            fontSize: '18px',
                            borderRadius: '8px',
                            flex: '1',
                            marginBottom: '10px',
                            height: '100%'
                            }}
                        onChange={(e) => setFiller({...filler, question: e.target.value})}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.shiftKey) {
                                handleFiller();
                            }
                        }}
                    >
                    </textarea>
                    <button style={{alignSelf: 'flex-end'}} onClick={()=>handleFiller()}><i className="fa fa-send">
                    </i></button>
                </div>
              </div>
            </div>

        <div className={`d-flex overflow-hidden h-100 flex-grow-1`} style={{border: '1px solid white'}}>
            <div className="w-50 d-flex">
              <div id="Form" className="d-flex flex-grow-1 flex-column ">
                <div className="d-flex justify-content-between align-items-center" style={{fontSize: '15px', backgroundColor: '#e2ebf0'}}>
                    <div>
                    </div>
                    <div>Form</div>
                    <div className={'d-flex'}>
                        <div style={{marginRight: '5px', backgroundColor: '#cfd9df'}} type='button' onClick={()=>handleFillerShow()}>Form Copilot<Image
                                alt="logo"
                                src= {process.env.PUBLIC_URL + '/FormCopilot.png'}
                                width="35"
                                height="35"
                                className="dialog-portrait-img"
                            /></div>
                    {warnData.length===0 ? <div></div> :
                        <div style={{position: 'relative'}}>
                            <div id="warnInfo" className={`collapse`} style={{ position: 'absolute', top: '20px' , right: '30%', zIndex: '1001', padding: '5px',backgroundColor: '#cfd9df', border: '1px solid gray'}}>
                                {warnData.map((warn, index) => {
                                return (
                                    <div style={{whiteSpace: 'nowrap'}}>{index+1}: {warn}</div>
                                )
                                })}
                            </div>
                            <div data-bs-toggle="collapse" data-bs-target="#warnInfo">
                                <i className="fa fa-warning" style={{color: 'yellowgreen'}}>
                                </i>{warnData.length}
                            </div>
                        </div>
                    }
                    </div>
                </div>
                <div className="d-flex flex-grow-1 overflow-auto" style={{backgroundColor: '#ebedee', border: '1px solid gray'}}>
                  <Form fields={fields} handleDataChange={handleDataChange} handleRun={handleRun} handleFiller={handleFillerShow}/>
                </div>
              </div>
              <div style={{padding: '10px', paddingTop: '30px'}}>
                <div className="btn-group-vertical">
                  {state.CompilerLoading && <span className="spinner-border spinner-border-sm">
                  </span>}
                  <OverlayTrigger placement="top" overlay={<Tooltip>Structured Prompt to Natural language prompt</Tooltip>}>
                      <button type="button" className="btn btn-primary" onClick={() => handleDeompiler()}><i className="fa fa-arrow-circle-right" style={{fontSize: '18px'}}>
                      </i></button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="bottom" overlay={<Tooltip>Natural language prompt to Structured prompt</Tooltip>}>
                      <button type="button" className="btn btn-primary" disabled={!state.isTextEdit} onClick={() => {handleCompiler()}}><i className="fa fa-arrow-circle-left" style={{fontSize: '18px'}}>
                      </i></button>
                  </OverlayTrigger>
                  {state.DecompilerLoading && <span className="spinner-border spinner-border-sm">
                  </span>}
                </div>
              </div>
            </div>
            <div className="w-50 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center" style={{fontSize: '15px', backgroundColor: '#e2ebf0'}}>
                    <div>
                    </div>
                    <div>Text</div>
                    <div style={{paddingRight: '5px',height: '25px'}}>
                        <label className="toggle-switch">
                            <input type="checkbox" onClick={() => {setState({...state, isTextEdit: !state.isTextEdit})}}/>
                                <div className="toggle-switch-background">
                                    <div className="toggle-switch-handle"/>
                                </div>
                        </label>
                    </div>
                </div>
              <div className="flex-grow-1 d-flex">
                  <textarea
                    className="form-control"
                    style={{
                      resize: 'none',
                      backgroundColor: '#ebedee',
                      fontFamily: 'Exo, serif',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}
                    readOnly={!state.isTextEdit}
                    value={nldes}
                    onChange={(e) => {
                      setNldes(e.target.value);
                    }}
                  />
              </div>
            </div>
        </div>
      </div>
      <div id="RunPromptPage" className={`PromptPage overflow-hidden collapse ${state.isPage === 2 || state.isPage === 3? 'show flex-grow-1' : ''}`}>
          <div className={`d-flex h-100`}>
              <RunStructuredPrompt
                  system={spldes}
                  splJson={fields}
                  historyRunMessage={state.historyRunMessage}
                  handleHistoryChange={(history)=>{setState({...state, historyRunMessage: history})}}
                  handleSavePrompt={handlePromptSave}
              />
          </div>
      </div>
      <div className="d-flex" style={{backgroundColor: '#e2ebf0', borderTop: '1px solid white'}}>
          <SPLItemBar/>
      </div>
    </div>
  );
}

export default BuildStructuredPrompt;
