let OpenAPIKey = ''
let history_0 = [
{"role": "system", "content": `Your task is to paraphrase the given text. First, you need to extract the keywords from the text, such as the task goal, task input, and task output. Then, rephrase these keywords following the given examples' format. Please note that the rewritten text should be as concise as possible, while indicating the task goal, task input, and task output.

Example-1:
Original Text: As an expert in analyzing movie reviews, you have the ability to delve into the emotions conveyed in the comments. You can identify the reviewer's sentiment, attitude, and viewpoint, and provide a comprehensive evaluation of the movie. Whether it's a comedy, action, drama, or sci-fi film, you can interpret the emotional nuances in each review through meticulous sentiment analysis.
Rewritten Text: A master of movie review analysis. Given movie reviews as input, you can generate the corresponding emotions.

Example-2:
Original Text: You are a high school physics teacher with excellent programming skills, capable of using programming to solve physics problems. You enjoy integrating programming with physics, enabling students to better understand physics concepts and phenomena through coding and computer simulations. You believe that programming is a powerful tool that can help students explore the physical world more deeply and develop their analytical thinking and problem-solving abilities.
Rewritten Text: A high school physics teacher who enjoys applying programming to solve physics problems. Given a physics problem as input, you can generate a program that solves the problem.`
}
]

let history_1 = [
    {"role": "user", "content": `You are an excellent high school mathematics tutor, but the math scores of your students are particularly poor.
Therefore, you want to provide detailed guidance while helping them solve mathematical problems.
What kind of AI character does the above information create?
Please summarize the above information using more concise words.\nAI character: `
    },
    {"role": "assistant", "content": "An excellent high school mathematics tutor."}
]
let history_2 = [
    {"role" : "user", "content": "What is the audience of this character?\nPlease summarize in more concise words\nThe audience: "},
    {"role" : "assistant", "content": "high school students with poor math scores."}
]
let history_3 = [
    {"role" : "user", "content": "What do you think an excellent high school mathematics tutor should do to achieve its goals?\nPlease provide step-by-step answers while keeping the responses as concise as possible, but logical. No more than two points"},
    {"role" : "assistant", "content": "1. Analyze the problem.\n2. Provide step-by-step guidance."}
]
let history_3_5 = [
    {"role" : "user", "content": "1. Analyze the problem.\n2. Provide step-by-step guidance.\n" +
                                      "Please generate a name for each of the above setps, no more than 3 words, as concise as possible"},
    {"role" : "assistant", "content": "Analyze problem\nProvide guidance"}
]
// # Context Control
let history_4 = [
    {"role" : "user", "content": "What should an excellent high school mathematics tutor pay attention to when implementing the above steps?\nPlease summarize in more concise words."},
    {"role" : "assistant", "content": "- Use clear and concise explanations, avoiding unnecessary jargon.\n"+
                                      "- Guide students through the problem-solving process step by step, emphasizing the logic and reasoning behind each step.\n"+
                                      "- Tailor your teaching strategies to cater to their individual needs and provide personalized assistance."}
]
let history_5 = [
    {"role" : "user", "content": "How should an excellent high school mathematics tutor implement the above steps?"},
    {"role" : "assistant", "content": `For step1 Analyzing the problem:
- Read and understand the problem statement together with the student.
- Identify the key information and any given conditions or constraints.
- Discuss and clarify any unfamiliar terms or symbols.
- Determine the specific mathematical concepts and skills required to solve the problem.

For step2 Providing step-by-step guidance:
- Break down the problem into smaller, more manageable steps.
- Clearly explain each step, including the underlying concepts and the reasoning behind it.
- Encourage students to actively participate by asking questions and offering their own insights.`}
]
let history_6 = [
    {"role" : "user", "content": "What are the details to be aware of when implementing the above steps?\n" +
                                      "Please briefly summarize"},
    {"role" : "assistant", "content": `In term of Enhancing the enjoyment of mathematics:
Avoid overly complex or ambiguous phrasing.
Provide appropriate explanations or mathematical concepts to facilitate user understanding.

In term of Providing step-by-step guidance:
It's important to review and refine the generated content to ensure clarity, accuracy, and coherence.
Ensure that the breakdown aligns with the intended approach and accurately reflects the underlying problem-solving process.`}
]
let history_7 = [
    {"role" : "user", "content": "What is the content and format of the output for the step Analyzing the problem?\n" +
                                      "Please provide point-by-point answers while keeping the responses as concise as possible, but logical.\nThe format of the output for the step: "},
    {"role" : "assistant", "content": "Its understanding and identification of the key information and knowledge points within the problem statement."}
]
let history_8 = [
    {"role" : "user", "content": "Give me an example for the above input and output content and formats of step Analyzing the problem."},
    {"role" : "assistant", "content":
`Input:
Problem Statement: Solve the following equation for x: 2x + 5 = 15.
Output:
Knowledge Points Identified:
Equation to be solved: 2x + 5 = 15
Variable involved: x
Required operation: Solve for x`}
]

async function getResponseFormAPI(prompt){
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: OpenAPIKey,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      max_tokens: 1024,
      temperature: 0,
      model: "gpt-3.5-turbo",
      messages: prompt,
    });
    return(completion.data.choices[0].message.content);
}

async function convert_des(description) {
    const information = "Original Text: " + description + "\nRewritten Text: "
    const messages = [...history_0, {"role": "user", "content": information}]
    return await getResponseFormAPI(messages)
}

async function conv_persona_des(input_1) {
    const prompt_1 = [...history_1]
    const information = input_1 + "\n" +
        "What kind of AI character does the above information create?\n" +
                                   "Please summarize the above information using more concise words.\nAI character: "
    prompt_1.push({"role": "user", "content": information})
    const messages = [{"role": "system", "content": "You are a helpful assistant"}, ...prompt_1]
    return await getResponseFormAPI(messages)
}
async function conv_audience_des(input_1, input_2) {
    const prompt_2 = [...history_1, ...history_2]

    const information = input_1 + "\n" +
        "What kind of AI character does the above information create?\n" +
                                   "Please summarize the above information using more concise words.\n" +
                  +input_2 + "\nWhat is the audience of this character?\n" +
                              "Please summarize in more concise words.\nThe audience: "
    prompt_2.push({"role": "user", "content": information})
    const messages = [{"role": "system", "content": "You are a helpful assistant"}].concat(prompt_2)
    return await getResponseFormAPI(messages)
}

async function conv_instruction(input_1, input_2, input_3) {
    const prompt_3 = [...history_1, ...history_2, ...history_3]
    const information = input_1 + "\n"
        + "What kind of AI character does the above information create?\n" +
                                   "Please summarize the above information using more concise words.\n"
                  +input_2 + "\nWhat is the audience of" + input_2 + "?\n" +
                                                                      "Please summarize in more concise words.\n"
                  +input_3 + "\nWhat do you think" + input_2 + "should do to achieve its goals?\n" +
                                                                "Please provide step-by-step answers while keeping the responses as concise as possible, but logical. No more than two points\n"
    prompt_3.push({"role": "user", "content": information})
    const messages = [{"role": "system", "content": "You are a helpful assistant"}].concat(prompt_3)
    return await getResponseFormAPI(messages)
}

async function conv_ins_name(input_1) {
  const prompt_1 = [];
  const information =
    input_1 + "\n" +
      "Please generate a name for each of the above steps, no more than 3 words, as concise as possible.";
  prompt_1.push({ "role": "user", "content": information });

  const messages = [
    { "role": "system", "content": "You are a helpful assistant" },...history_3_5,
    ...prompt_1 // Use the spread operator to merge arrays correctly
  ];
  return await getResponseFormAPI(messages);
}

async function concontrol_rule(input_1, input_2, input_3, input_4) {
    const prompt_4 = [...history_1 , ...history_2 , ...history_3 , ...history_4]
    const information = input_1 + "\n"
        + "What kind of AI character does the above information create?\n" +
                   "Please summarize the above information using more concise words.\n"
                   +input_2 + "\nWhat is the audience of " + input_2 + "?\n"+
                   "Please summarize in more concise words.\n"
                   +input_3 + "\nWhat do you think " + input_2 + "should do to achieve its goals?\n" +
                   "Please provide step-by-step answers while keeping the responses as concise as possible, but logical.\n"
                   +input_4 + "\nWhat should" + input_2 + " pay attention to when implementing the above steps?\n" +
                   "Please summarize in more concise words.\n"
    prompt_4.push({"role": "user", "content": information})
    const messages = [{"role": "system", "content": "You are a helpful assistant"}, ...prompt_4]
    return await getResponseFormAPI(messages)
}
async function conv_ins_commands(input_1, input_2, input_3, input_4) {
  const prompt_5 = [...history_1, ...history_2, ...history_3, ...history_5];
  const information =
    input_1 +
    "\n" +
    "What kind of AI character does the above information create?\n" +
    "Please summarize the above information using more concise words.\n" +
    input_2 +
    "\nWhat is the audience of" +
    input_2 +
    "?\n" +
    "Please summarize in more concise words.\n" +
    input_3 +
    "\nWhat do you think" +
    input_2 +
    "should do to achieve its goals?\n" +
    "Please provide step-by-step answers while keeping the responses as concise as possible, but logical.\n" +
    input_4 +
    "\nHow should" +
    input_2 +
    "implement the above steps?\n";
  prompt_5.push({ role: "user", content: information });
  const messages = [
    { role: "system", content: "You are a helpful assistant" },
    ...prompt_5 // Use the spread operator to merge arrays correctly
  ];
   // Use the correct variable name for messages
    return await getResponseFormAPI(messages);
}

// # con_ins 生成主要的子任务步骤,可以作为ins的name
async function conv_ins_rule(input_1, input_2, input_3, input_4, input_5) {
  const prompt_6 = [...history_1, ...history_2, ...history_3, ...history_5, ...history_6];
  const information =
    input_1 +
    "\n" +
    "What kind of AI character does the above information create?\n" +
    "Please summarize the above information using more concise words.\n" +
    input_2 +
    "\nWhat is the audience of " +
    input_2 +
    "?\n" +
    "Please summarize in more concise words.\n" +
    input_3 +
    "\nWhat do you think " +
    input_2 +
    " should do to achieve its goals?\n" +
    "Please provide step-by-step answers while keeping the responses as concise as possible, but logical. No more than two points\n" +
    input_4 +
    "\nHow should " +
    input_2 +
    " implement the above steps?\n" +
    input_5 +
    "\nWhat are the details to be aware of when implementing the above steps?\nPlease briefly summarize.\n";

  prompt_6.push({ role: "user", content: information });
  const messages = [
    { role: "system", content: "You are a helpful assistant" },
    ...prompt_6 // Use the spread operator to merge arrays correctly
  ];


   // Use the correct variable name for messages
    return await getResponseFormAPI(messages);
}

// # 此方法需循环执行，执行次数由instruction数量决定
async function conv_ins_format(input_1, input_2, input_3, input_4, input_5, input_6) {
  const prompt_7 = [...history_1, ...history_2, ...history_3, ...history_5, ...history_6, ...history_7];

  const information =
    input_1 +
    "\n" +
    "What kind of AI character does the above information create?\n" +
    "Please summarize the above information using more concise words.\n" +
    input_2 +
    "\nWhat is the audience of " +
    input_2 +
    "?\n" +
    "Please summarize in more concise words.\n" +
    input_3 +
    "\nWhat do you think " +
    input_2 +
    " should do to achieve its goals?\n" +
    "Please provide step-by-step answers while keeping the responses as concise as possible, but logical.\n" +
    input_4 +
    "\nHow should " +
    input_2 +
    " implement the above steps?\n" +
    input_5 +
    "\nWhat is the content and format of the output for the step " + input_6 + "?\n" +
    "Please provide point-by-point answers while keeping the responses as concise as possible, but logical.\nThe format of the output for the step: ";
  console.log("format information ", information)
  prompt_7.push({ role: "user", content: information });

  const messages = [
    { role: "system", content: "You are a helpful assistant" },
    ...prompt_7 // Use the spread operator to merge arrays correctly
  ];


   // Use the correct variable name for messages
    return await getResponseFormAPI(messages);
}

// #####
async function conv_ins_example(input_1, input_2, input_3, input_4, input_5, input_6, input_7) {
  const prompt_8 = [...history_1, ...history_2, ...history_3, ...history_5, ...history_6, ...history_7, ...history_8];

  const information =
    input_1 +
    "\n" +
    "What kind of AI character does the above information create?\n" +
    "Please summarize the above information using more concise words.\n" +
    input_2 +
    "\nWhat is the audience of" +
    input_2 +
    "?\n" +
    "Please summarize in more concise words.\n" +
    input_3 +
    "\nWhat do you think" +
    input_2 +
    " should do to achieve its goals?\n" +
    "Please provide step-by-step answers while keeping the responses as concise as possible, but logical.\n" +
    input_4 +
    "\nHow should" +
    input_2 +
    " implement the above steps?\n" +
    input_5 +
    '\n' +
    "What is the content and format of the output for the step " +
    input_6 +
    "?\n" +
    "Please provide point-by-point answers while keeping the responses as concise as possible, but logical.\nThe format of the output for the step: " +
     input_7 +
    '\n' +
    "Give me an example for the above input and output content of the step: " +
    input_6 +
    ".\n";

  prompt_8.push({ role: "user", content: information });

  const messages = [
    { role: "system", content: "You are a helpful assistant" },
    ...prompt_8 // Use the spread operator to merge arrays correctly
  ];
   // Use the correct variable name for messages
    return await getResponseFormAPI(messages);
}

async function require2json(user_input, apiKey) {
  OpenAPIKey = apiKey;
  try {
      user_input = await convert_des(user_input);
  } catch (e) {
    console.log("rewrite Error");
  }
  const per_des_content = await conv_persona_des(user_input);
  let per_des = per_des_content.replace("AI character: ", "");
  const aui_des_content = await conv_audience_des(user_input, per_des);
  let aui_des = aui_des_content.replace("The audience: ", "");
  const instructions = await conv_instruction(user_input, per_des, aui_des);
  let instructions_names = [];
  try {
    instructions_names = await conv_ins_name(instructions);
    instructions_names = instructions_names.split("\n");
  } catch (e) {
    console.log(`Split Example: ${e}`);
  }
  const control_rule = await concontrol_rule(user_input, per_des, aui_des, instructions);
  const instructions_commands = await conv_ins_commands(user_input, per_des, aui_des, instructions);
  const instructions_rule = await conv_ins_rule(user_input, per_des, aui_des, instructions, instructions_commands);

  let ContextControl_content = [];
  if (control_rule.replaceAll('- ', '').split('\n').length >= 0) {
    ContextControl_content = control_rule.replaceAll('- ', '').split('\n').slice(0, -1);
  }
  const jsonData = [
    {
      "id": 1,
      "annotationType": "Persona",
      "section": [
        {
          "sectionId": "S1",
          "sectionType": "Description",
          "content": per_des
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
          "content": aui_des
        }
      ]
    },
    {
      "id": 3,
      "annotationType": "ContextControl",
      "section": [
        {
          "sectionId": "S1",
          "sectionType": "Rules",
          "content": ContextControl_content
        }
      ]
    }
  ];

  // # 需要确定instruction的数量
  const ins_format = [];
  const instructions_example = [];

  const instructionsArray = instructions.split('\n');
  for (let i = 0; i < instructionsArray.length; i++) {
    ins_format.push(await conv_ins_format(user_input, per_des, aui_des, instructions, instructions_commands, instructionsArray[i]));
    instructions_example.push(await conv_ins_example(user_input, per_des, aui_des, instructions, instructions_commands, instructionsArray[i], ins_format[i]));
    // console.log(instructions_example[i]);
  }
  console.log(ins_format.length)
  console.log("ins_format", JSON.stringify(ins_format))

  console.log(instructions_example.length)
  console.log("instructions_example", JSON.stringify(instructions_example))

  let i = 0;
  let instructions_commandsArray = instructions_commands.split('\n\n');
  instructions_commandsArray = instructions_commandsArray.filter((command) => command.includes("For step"));
  const instructions_ruleArray = instructions_rule.split("\n\n");
  const instructions_exampleArray = instructions_example.map(example => example.replace("Input:\n", '').split("\nOutput:"));
  instructions_commandsArray.forEach((desc)=>{
    const instruction = {
      "id": i + 4,
      "annotationType": 'Instruction',
      "section": []
    };

    try {
      instruction['section'].push({
        "sectionId": "S5",
        "sectionType": "Name",
        "content": instructions_names[i]
      });
    } catch (e) {
      console.log(`Error while adding section: ${e}`);
    }

    try {
      instruction['section'].push({
        "sectionId": "S1",
        "sectionType": "Commands",
        "content": desc.replaceAll("- ", "").split('\n').slice(1)
      });
    } catch (e) {
      console.log(`Error while adding section: ${e}`);
    }

    try {
      instruction['section'].push({
        "sectionId": "S4",
        "sectionType": "Rules",
        "content": instructions_ruleArray[i].replaceAll("- ", "").split('\n').slice(1)
      });
    } catch (e) {
      console.log(`Error while adding section: ${e}`);
    }

    try {
      instruction['section'].push({
        "sectionId": "S2",
        "sectionType": "Format",
        "content": ins_format[i].replaceAll("- ", "")
      });
    } catch (e) {
      console.log(`Error while adding section: ${e}`);
    }

    try {
      instruction['section'].push({
        "sectionId": "S3",
        "sectionType": "Example",
        "content": {
          "input": instructions_exampleArray[i][0].trim(),
          "output": instructions_exampleArray[i][1].trim()
        }
      });
    } catch (e) {
      console.log(`Error while adding section: ${e}`);
    }

    jsonData.push(instruction);
    i++;
  })
  console.log(jsonData);
  return jsonData;
}

module.exports = { require2json };
// const user_input = "Plan laboratory robot actions. The robot can navigate lab areas, retrieve hazardous materials, locate equipment, operate devices. Areas include workstation, storage. Objects include chemicals, instruments, reactors, samples, etc."
// require2json(user_input, '')
// .then((result) => {
// // console.log(JSON.stringify(result));
// })
// .catch((error) => {
// console.error('Error:', error);
// });
