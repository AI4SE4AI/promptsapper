import React, {useState} from "react";
import {Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const robotAdd = process.env.PUBLIC_URL + '/robot-add.png';
const robotBuild = process.env.PUBLIC_URL + '/form.png';
const Require2Data =`
Pattern:
Project name and requirements: <Basic information of the project>
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
Project name and requirements:
{
      name : "NPC Creator",
      Requirement : "Based on the user's input description, generate a non-player character (NPC) for a role-playing game (RPG) that conforms to specific rules and is suitable for children aged 6-12. "
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
      "id": 3,
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
        }
      ]
    }
]
==================================================
annotationType can only be selected from the following list [Metadata, Persona, Audience, Terminology, ContextControl, Instruction].
The format of "Rules", "Terms" and "Commands" is ["", ""]
Please output in strict JSON format.
`

const AddStructuredPrompt = ({handleFieldChange, handleStateChange, handleNameChange}) => {
    const initdata = {name: '', requirement: ''};
    const [data, setData] = useState(initdata); // 修改了这一行
    const [loading, setLoading] = useState(false)

    const fetchData=()=> {
        setLoading(true);
        fetch('https://www.aichain.store/require2json', {
            method: 'POST', // 请求方法（GET、POST、PUT、DELETE等）
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // 要发送的数据
                name: data.name,
                requirement: data.requirement,
                apiKey: localStorage.getItem('apiKey')
            })
        })
        .then(response => response.json()) // 解析响应数据为 JSON
        .then(data => {
            handleFieldChange(data.data);
            handleStateChange(1);
            setLoading(false);
        })
        .catch(error => {
            // 处理错误
            console.error(error);
            setLoading(false);
            toast.error('Please check the network and click Generate Prompt button again');
        });
  }

    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div>
            <div className="container-fluid" style={{padding: '5px'}}>
                <br/>
                <div style={{fontSize: '18px'}}>Please name your prompt.</div>
                <input
                    value={data.name}
                    onChange={(e) => {setData({...data, name: e.target.value}); handleNameChange(e.target.value)}}
                    className="form-control"
                    style={{ resize: 'none' }}
                    placeholder= "Example: NPC Creator"
                />
                <br/>
                <p style={{fontSize: '18px'}}>Please tell me the role you want to create and who it serves.</p>
                <textarea
                    value={data.requirement}
                    onChange={(e) => setData({...data, requirement: e.target.value})}
                    className="form-control"
                    rows= {(data.requirement.split("\n").length ===1 && 2) || data.requirement.split("\n").length}
                    placeholder= "Example: Based on the user's input description, generate a non-player character (NPC) for a role-playing game (RPG) that conforms to specific rules and is suitable for children."
                    style={{resize: "none"}}
                />
                <br/>
                <hr/>
                <br/>
                <button type="button"  className="btn btn-primary" onClick={fetchData}
                >Step1: Generate Prompt</button>{loading && (<span style={{color: 'green'}}><span style={{paddingLeft: '10px'}}>Generating</span>
                <span className="spinner-border spinner-border-sm">
                </span></span>)}
                <br/>
            </div>
        </div>
      </>
    );
}

export default AddStructuredPrompt;
