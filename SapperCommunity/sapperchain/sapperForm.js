let OpenAPIKey = ''
let system = {"all": "You are a team that assists in filling in structured prompts based on knowledge in the knowledge, and when users select relevant members of the team, the corresponding members give corresponding answers based on the relevant information.",           "technology": "Knowledge base settings:# A Pattern-Oriented Language for Structured Prompting\n\"\"\"\nannotation-type is from Sapper Promptmanship.\nThey are \"keywords\" of structured prompting language.\nThey serve as meta-prompt that specify the LLM's interpretation of structured prompt parts.\n\"\"\"\nannotation-type= annotation-symbol annotation-type-name separator annotation-type-desc\nannotation-type-name= metadata | persona | audience | terminology | context-control| instruction | format | example | command | comment | rule \nannotation-type-definition= nldesc\n\"\"\"\nstructured prompting language is a language between natural language and programming language, analogous to the intermediate bytecode in between high-level programming language and machine instructions.\nstructured prompting language has the same expressiveness and semantics as natural language, and provides a standardized format for communicating with AI.\nstructured prompts in structured prompting language should be able to be \"compiled\" from natural language prompts, and be \"de-compiled\" into natural language prompts.\nBoth \"compile\" and \"de-compile\" can be done through LLM.\n\"De-compiling\" structured prompts into natural language prompts requires the LLM to understand structured prompting language \"keywords\" and structure.\n\"Compiling\" natural language prompts into structured prompts requires the LLM to perform NLU, NER, and structured \"translation\".\nA GUI wizard with the bidirectional StructuredPrompt-NLPrompt (de)compilation support helps the user develop structured prompts.\n\"\"\"\nstructured-prompt-body ::= {metadata-prompt} {[persona-part] | [audience-part] | {terminology-part} | {context-control-part}} {instruction-prompt}\nmetadata-prompt= [name] {comment-prompt} [description] | def-value {description | def-value}\npersona-prompt= [name] {comment-prompt} {rule-prompt} [description]\naudience-prompt= [name] {comment-prompt} {rule-prompt} [description]\nterminology-prompt= [name] {comment-prompt} {rule-prompt} [description]| def-value {description | def-value}\ncontext-control-prompt= [name]{comment-prompt} {rule-prompt} [description] | def-value {description | def-value}\ninstruction-part=[name] {comment-prompt} {rule-part} {command-prompt} {format-part} {example-prompt}\ncomment-prompt =desc \nrule-prompt= desc \ncommand-prompt=desc \nformat-prompt= desc \nexample-prompt=input desc separator output desc\ndesc =description | code | equation\ndef-value= identifier assign value | identifier assign left-bracket value-tuple|identifier-tuple assign value-tuple | identifier-tuple assign value-tuple-list\n\"\"\"\nNOTE:\n[xxx] means 0 or 1 time\n{xxx} means >=0 times\n\"\"\""
          }
let functionDesc=`
Related information:
1. Persona is used to describe the role or character related to the task, and the description is the only auxiliary table in Persona used to describe the set character. Persona is a component of context. (Example: description: You are a creative NPC creator.)
2. Instruction is used to provide clear instructions or steps to the model, including command, rule, format, and example as its four auxiliary tables. Command is the command, Instruction is like a function, and command is one of the codes in Instruction; rule is the condition of Instruction, which can include index and description; format is used to define the format or layout requirements of Instruction; example provides sample inputs and outputs for the command. (Example: rule: Characteristics such as name, age, armor, and items must be suitable for the target audience. Command: Wait for user input on NPC description. Format: '<NPC description>,' 'name:<NPC name>,' 'age:<NPC age>,' 'armor:<select one from weapons>,' 'items:<three items appropriate for this NPC>,' ''. comment:)
3. Audience is the audience of the tool, and description is the detailed description of the audience. (Example: description: Children aged 6-12.)
4. Terminology is used to explain or define specific terminology or vocabulary. The type of def-value is specific Definition assignment type, including identifier assign value (A=B), identifier assign left-bracket value-tuple right-bracket (A=BC), identifier-tuple assign value-tuple (AB=CD), identifier-tuple assign left-bracket value-tuple-list right-bracket (AB=[CD, EF]). Customized and interpreted related terms are also allowed. (Example: Equipment = 'sword, axe, staff, spear.' Or planner: someone responsible for planning or organizing tasks.)
5. ContextControl is used to define context control information in structured prompts, and the rule is the context control rule. (Example: rule: The AI tutor's configuration/preferences must be set by the user.)

As a member of the team, your task is to answer user-related questions based on the Related information and knowledge base settings I provide.

Here is a example:
Input:What is instruction?
Output:
Instruction is used to provide clear instructions or steps to the model, including name,command, rule,comment, format, and example as its four auxiliary tables. Command is the command, Instruction is like a function, and command is one of the codes in Instruction; rule is the condition of Instruction, which can include index and description; format is used to define the format or layout requirements of Instruction;Used to add annotations or descriptive comments to the instruction for this goal; example provides sample inputs and outputs for the command. (Example: name:Create NPC;rule: Characteristics such as name, age, armor, and items must be suitable for the target audience. Command: Wait for user input on NPC description.Comment:he NPC name should reflect their characteristics and be appropriate for the target audience. Format: '<NPC description>,' 'name:<NPC name>,' 'age:<NPC age>,' 'armor:<select one from weapons>,' 'items:<three items appropriate for this NPC>,' ''.)
(END OF EXAMPLE)

Note:The total output word count should not exceed 300 words.

`
let usage=`
Sequence Information:
1. If you want to implement an if statement in SPL, you can write 'output prompt for if statement content' in the rule of Instruction.
Output: Add an Instruction, then add a rule to the Instruction, and fill in the content contained in the if in the rule.
2.If you want to implement multiple assignment forms, you can define them in Terminology's def-value.
Output: Add a Terminology and then use the def-value function in Terminology.

As a member of the team, your task is to match the questions received with the sequence information and knowledge base settings provided by me. If a similarity higher than 90% is found, directly output the corresponding sequence information. If there is no match, select the information with the highest similarity and use a large model to output the answer to the corresponding question.

Note: The output format is the same as the format in the output information above, 'what plate to add, then what to use...' natural language.
`

let refer_prompt = `Please learn the following structured-prompt language (SPL), which also serves as the guideline for filling out forms.
Note: nldes represents a natural language description, and des represents a general description.
SPL: [
    annotation-type is from Sapper Promptmanship.
They are \"keywords\" of structured prompting language.
They serve as meta-prompt that specify the LLM's interpretation of structured prompt parts.
annotation-type= annotation-symbol annotation-type-name separator annotation-type-desc
annotation-type-name= metadata | persona | audience | terminology | context-control| instruction | format | example | command | comment | rule
annotation-type-definition= nldesc
structured prompting language is a language between natural language and programming language, analogous to the intermediate bytecode in between high-level programming language and machine instructions.
structured prompting language has the same expressiveness and semantics as natural language, and provides a standardized format for communicating with AI.
structured prompts in structured prompting language should be able to be \"compiled\" from natural language prompts, and be \"de-compiled\" into natural language prompts.
Both \"compile\" and \"de-compile\" can be done through LLM.
\"De-compiling\" structured prompts into natural language prompts requires the LLM to understand structured prompting language \"keywords\" and structure.
\"Compiling\" natural language prompts into structured prompts requires the LLM to perform NLU, NER, and structured \"translation\".
A GUI wizard with the bidirectional StructuredPrompt-NLPrompt (de)compilation support helps the user develop structured prompts.
structured-prompt-body ::= {metadata-prompt} {[persona-part] | [audience-part] | {terminology-part} | {context-control-part}} {instruction-prompt}
metadata-prompt= [name] {comment-prompt} [description] | def-value {description | def-value}
persona-prompt= [name] {comment-prompt} {rule-prompt} [description]
audience-prompt= [name] {comment-prompt} {rule-prompt} [description]
terminology-prompt= [name] {comment-prompt} {rule-prompt} [description]| def-value {description | def-value}
context-control-prompt= [name]{comment-prompt} {rule-prompt} [description] | def-value {description | def-value}
instruction-part=[name] {comment-prompt} {rule-part} {command-prompt} {format-part} {example-prompt}
comment-prompt =desc
rule-prompt= desc
command-prompt=desc
format-prompt= desc
example-prompt=input desc separator output desc
desc =description | code | equation
def-value= identifier assign value | identifier assign left-bracket value-tuple|identifier-tuple assign value-tuple | identifier-tuple assign value-tuple-list
NOTE:
[xxx] means 0 or 1 time
{xxx} means >=0 times

]

To fill out the form using SPL, there are a total of 7 sectionTypes that can be added in the outermost layer. They are, in order: 1. Metadata, 2. Persona, 3. Audience, 4. Terminology, 5. Context-control, 6. Instruction.
Each sectionType corresponds to different paradigms in SPL. For example, the SPL paradigms for "Metadata" are as follows:
    metadata-part ::= @metadata [identifier] left-bracket metadata-prompt right-bracket;
    metadata-prompt ::= {comment-part} nldesc | def-value {[delimiter] nldesc | def-value}
When filling out the form, you can add multiple subsectionTypes that comply with the corresponding SPL for each sectionType.
The total available subsectionTypes are: "Comment", "Rules", "Commands", "Format", "Example"and "Description".
The "Description" subsectionType corresponds to "desc" or "nldesc" in SPL and can only be added to the "Metadata", "Persona", and "Audience".
Each sectionType allows adding different subsectionTypes based on the corresponding SPL. For example, the "Instruction" sectionType, based on its corresponding SPL, allows the addition of subsectionTypes such as "Comment", "Rules", "Commands", "Format" and "Example".
Expect to the "Description", each subsectionType corresponds to different paradigm in SPL. For example, the SPL paradigms corresponding to "Rules" are as follows:
    rule-part ::= @rule [@paradigm-name] [left-bracket] rule-prompt [right-bracket]
    rule-prompt ::= [index] desc {[delimiter] [index] desc}

You will receive data from forms that users fill out according to the SPL. Map the form data to the SPL. And then output the SPL paradigms corresponding to the form data.
If sectionType contains subsectionType, then the SPL corresponding to this point includes not only the SPL paradigm corresponding to sectionType, but also the SPL paradigm corresponding to subsectionType.
Note: Please branch output, as many sectiontypes as there are points.
You only need to reply in the format of the example below.
Here's an example:
Form data: {
  "id": 4,
  "sectionType": 'Instruction',
  "subsection": [
    {
        "subsectionId": "S1",
        "subsectionType": "Commands",
        "content": ["wait for the user to enter NPC description","create a NPC profile for an RPG game in JSON format based on the input NPC description"]
    },
    {
        "subsectionId": "S2",
        "subsectionType": "Rules",
        "content": ["name, age, armor and items must be appropriate for the target audience", "armor must be in weapons"]
    },
    {
        "subsectionId": "S3",
        "subsectionType": "Format",
        content: " description : <NPC description>,\\n            name : <NPC name>,\\n            age : <NPC age>,\\n            armor : <select one from weapons>,\\n            items : <three items appropriate for this NPC>,"
    }
  ]
},
(END OF EXAMPLE)
'SPL paradigms corresponding to the form data: [
    instruction-prompt= {comment-part} {rule-part} {command-part}{format-part} {example-part}
    command-prompt ::= [index] desc {[delimiter] [index] desc}
    rule-prompt ::= [index] desc {[delimiter] [index] desc}
    format-prompt ::= [index] desc {[delimiter] [index] desc}
]'`

let reflection_prompt = `You are a form validation assistant, helping users fill in forms with standardized and accurate information.
Your task is to examine and reflect on the form data that the user has filled out in accordance with the form filling specification.
The following steps will use four lists named "Suggested-action", "Location", "Reason", and "Suggested-content".
Please receive the form data input by the user, conduct the reflection process, and output the four lists of "Suggested-action", "Location", "Reason", and "Suggested-content".
The input is form data entered by user.
The output is the result of "Suggested-action", "Location", "Reason", and "Suggested-content" after reflection process.


Please learn the following structured-prompt language (SPL), which also serves as the guideline for filling out forms.
Note: nldes represents a natural language description, and des represents a general description.
SPL: [
    annotation-type is from Sapper Promptmanship.
They are \"keywords\" of structured prompting language.
They serve as meta-prompt that specify the LLM's interpretation of structured prompt parts.
annotation-type= annotation-symbol annotation-type-name separator annotation-type-desc
annotation-type-name= metadata | persona | audience | terminology | context-control| instruction | format | example | command | comment | rule
annotation-type-definition= nldesc
structured prompting language is a language between natural language and programming language, analogous to the intermediate bytecode in between high-level programming language and machine instructions.
structured prompting language has the same expressiveness and semantics as natural language, and provides a standardized format for communicating with AI.
structured prompts in structured prompting language should be able to be \"compiled\" from natural language prompts, and be \"de-compiled\" into natural language prompts.
Both \"compile\" and \"de-compile\" can be done through LLM.
\"De-compiling\" structured prompts into natural language prompts requires the LLM to understand structured prompting language \"keywords\" and structure.
\"Compiling\" natural language prompts into structured prompts requires the LLM to perform NLU, NER, and structured \"translation\".
A GUI wizard with the bidirectional StructuredPrompt-NLPrompt (de)compilation support helps the user develop structured prompts.
structured-prompt-body ::= {metadata-prompt} {[persona-part] | [audience-part] | {terminology-part} | {context-control-part}} {instruction-prompt}
metadata-prompt= [name] {comment-prompt} [description] | def-value {description | def-value}
persona-prompt= [name] {comment-prompt} {rule-prompt} [description]
audience-prompt= [name] {comment-prompt} {rule-prompt} [description]
terminology-prompt= [name] {comment-prompt} {rule-prompt} [description]| def-value {description | def-value}
context-control-prompt= [name]{comment-prompt} {rule-prompt} [description] | def-value {description | def-value}
instruction-part=[name] {comment-prompt} {rule-part} {command-prompt} {format-part} {example-prompt}
comment-prompt =desc
rule-prompt= desc
command-prompt=desc
format-prompt= desc
example-prompt=input desc separator output desc
desc =description | code | equation
def-value= identifier assign value | identifier assign left-bracket value-tuple|identifier-tuple assign value-tuple | identifier-tuple assign value-tuple-list
NOTE:
[xxx] means 0 or 1 time
{xxx} means >=0 times

]

To fill out the form using SPL, there are a total of 7 sectionTypes that can be added in the outermost layer. They are, in order: 1. Metadata, 2. Persona, 3. Audience, 4. Terminology, 5. Context-control, 6. Instruction, 7. Prompt-committee.
Each sectionType corresponds to different paradigms in SPL. For example, the SPL paradigm for metadata is as follows:
    metadata-part ::= @metadata [identifier] left-bracket metadata-prompt right-bracket;
    metadata-prompt ::= {comment-part} nldesc | def-value {[delimiter] nldesc | def-value}
When filling out the form, you can add multiple subsectionTypes that comply with the corresponding SPL for each sectionType.
The only available subsectionTypes are: "Comment", "Rules", "Commands", "Format", "Example"and "Description".
The "Description" subsectionType corresponds to "desc" or "nldesc" in SPL and can only be added to the "Metadata", "Persona", and "Audience".
Each sectionType allows different subsectionTypes based on the corresponding SPL. For example, the instruction sectionType, based on its corresponding SPL, allows the addition of subsectionTypes such as "Comment", "Rules", "Commands", "Format" and "Example".
Expect to the Description, each subsectionType corresponds to a paradigm in SPL. For example, the SPL paradigm corresponding to "Rules" is as follows:
    rule-prompt ::= [index] desc {[delimiter] [index] desc}

Input:
You will receive the form data entered by the user, and the following is the correspondence between the form data and the SPL:
{{form2SPL}}

Reflection process:
Please refer to SPL and the above correspondence between the form data and the SPL.
1.Point-by-point analysis for each sectionType:
    (1) Compare the correspondence between the form data and the SPL with the complete SPL and identify the subsectionType that is missing for each sectionType;
    (2) For each missing subsectionType,consider it can be added to the current form data, except "Description", "nldesc", and "desc";
    (3) If it can be added, provide a brief justification from a feasibility perspective (2-3 sentences) and proceed to (5), (6), and (7);
    (4) If there is no any subsectionType can be added, you need not to output current sectionType and output anything for current sectionType.
    (5) Record the current location in the "Location" list: location["sectionType: {name of the current sectionType}", "subsectionType: {name of the subsectionType to be added}"]. Add the justification to the "Reason" list;
    (6) Reflect on the entire form and suggest what information should be filled in if this subsectionType is added (1-3 sentences). Add the suggestion to the "Suggested-content" list.
    (7) Add "Add subsectionType" to the "Suggested-action" list.
2.Reflection on the entire form to consider structural and feasibility aspects for recommending the addition of sectionType:
    (1) Compare the correspondence between the form data and the SPL with the complete SPL and identify the missing sectionTypes;
    (2) Consider whether the missing sectionTypes can be added to the current form data;
    (3) If they can be added, provide a brief justification from a feasibility perspective (2-3 sentences) and proceed to (5), (6), and (7);
    (4) If there is no any sectionType can be added, you need not to output anything for this poing;
    (5) Record the current location in the "Location" list: Location["sectionType: {name of the sectionType to be added}", "subsectionType: {all subsectionTypes included in the sectionType to be added}"]. Add the justification to the "Reason" list;
    (6) Reflect on the entire form and suggest what information should be filled in if this subsectionType is added (1-3 sentences). Add the suggestion to the "Suggested-content" list.
    (7) Add "Add sectionType" to the "Suggested-action" list.

Ouput: Please output the the result of "Suggested-action", "Location", "Reason", and "Suggested-content" after reflection process, the output format is as follows:
    [Suggested-action,
     Location,
     Reason,
     Suggested-content
    ]

Your final response should contain only the output, not the input and reflection process.`

let trans_NL=`The recommended results obtained through reflection on the form are stored in four separate lists. These four lists are as follows:

Suggested-action: Stores suggested actions to be taken, including "Add sectionType" and "Add subsectionType" actions.
Location: Records the location where the action should take place.
Reason: Records the reasons for taking the current action, based on feasibility analysis.
Suggested-content: Provides recommendations for the specific content to be added with the current action.

Here are the specific contents of these four lists:
{{list}}

The specific contents of these four lists serve as input. Please summarize the elements with matching indices from these lists in 2-3 sentences. Then provide the summarized points as output. Your final response should only include the output without the input.

Note:1)Output up to five suggestions.\n2)The output should not be interrupted.
Here are  some examples:
1,
Input: [
    Suggested-action: [Add subsectionType],
    Location: ["subsectionType":"Example"],
    Reason: [This is because the current expression of the output format in the Instruction section is somewhat vague, which can lead to unstable output results and ultimately fail to meet the intended expectations.],
    Suggested-content: []
]

Output: [
    1，I suggest adding a subsection called "Example" under the "Instruction" section. This is because the current expression of the output format in the Instruction section is somewhat vague, which can lead to unstable output results and ultimately fail to meet the intended expectations.
         2,
]
2,
Input:[
    Suggested-action: [Add sectionType, Add subsectionType],
    Location: [sectionType: "Metadata", subsectionType: "Comment"],
    Reason: [The form data is missing the Comment subsectionType for the Metadata sectionType.],
    Suggested-content: [Consider adding a Comment subsectionType to provide additional information or clarification about the purpose or requirment of the form.]
]
Output:[1, I suggest adding a section called "Metadata" to the form. This is because the form data is missing the Comment subsectionType for the Metadata sectionType.
        2, I suggest adding a subsection called "Comment" under the "Metadata" section. This is because the form data is missing the Comment subsectionType for the Metadata sectionType. Consider adding a Comment subsectionType to provide additional information or clarification about the purpose or requirment of the form.

(END OF EXAMPLE)
`
async function getResponseFormAPI(prompt){
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: OpenAPIKey,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      max_tokens: 1024,
      temperature: 0.3,
      model: "gpt-3.5-turbo",
      messages: prompt,
    });
    return(completion.data.choices[0].message.content);
}

async function call_llm(system_prompt, user_prompt){
    const prompt = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    return await getResponseFormAPI(prompt)
}

function multiple_replace(text) {
  const adict = {
    "annotationtype ": "",
    " annotationtype.": "."
  };

  const rx = new RegExp(Object.keys(adict).map(escapeRegExp).join('|'), 'g');

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function one_xlat(match) {
    return adict[match];
  }

  return text.replace(rx, one_xlat);
}




async function function_q_a(human) {
    const system_prompt = system["all"] + '\n' + system["technology"] + '\n' + functionDesc
    const user_prompt = 'Human_Qustion:' + human
    const reply = await call_llm(system_prompt, user_prompt)
    return multiple_replace(reply)
}

async function usage_q_a(human) {
    const system_prompt = system["all"] + '\n' + system["technology"] + '\n' + usage
    const user_prompt = 'Human_Qustion:' + human
    const reply = await call_llm(system_prompt, user_prompt)
    return multiple_replace(reply)
}

async function form_refer_bnf(form_data) {
    const reply = await call_llm(refer_prompt, form_data)
    return String(reply)
}

async function reflection(form_data){
    const refer_data = await form_refer_bnf(form_data)
    const com_prompt = reflection_prompt.replace('{{form2SPL}}', refer_data)
    const reply = await call_llm(com_prompt, form_data)
    const tr_prompt=trans_NL.replace('{{list}}',reply)
    const messages=[{"role": "system", "content": tr_prompt}];
    return await getResponseFormAPI(messages)
}

let system_1 = 'Persona, used to describe the characteristics and background of a fictional or real character or character.'
let system_2 = 'Audience, used to describe the target audience or user of the task.'
let system_3 = 'Instruction is used to describe the specific working process and corresponding annotations in a structured prompt for a certain function of a tool.'
let system_4 = 'Contextcontrol is a global constraint used to guide or adjust contextual information or control parameters when generating text.'


async function recommend(form_data, human_propose) {
  const system = `${system_1}\n${system_2}\n${system_3}\n${system_4}\n`;
  let user_had = form_data;
  const system_prompt =
    "First, learn to remember the definition of 'persona、audience、instruction、contextcontrol' in the " +
    system +
    ".Then match the user input to the four modules of 'persona、audience、instruction、control_rule'and output the module that best matches.\n" +
    "Note:1,Only the most consistent module name is output, and no other information is output.\n" +
    "2,The output must be a word in 'persona, audience, instruction, contextcontrol'.\n";
  const result = await call_llm(system_prompt, human_propose);
  user_had =
    'The project has already filled in content ' +
    user_had +
    ', and now we need to use the ' +
    result +
    ' module defined in the structured prompt of the knowledge base above to achieve the purpose' +
    human_propose;
  let content = '';

  if (result.includes('persona')) {
    content = "Create and fill out a Persona\n" + (await conv_persona_des(user_had));
  } else if (result.includes('audience')) {
    content = "Create and fill out an Audience\n" + (await conv_audience_des(user_had));
  } else if (result.includes('instruction')) {
    content = "Create and fill out an Instruction\n" + (await conv_instruction(user_had));
  } else if (result.includes('contextcontrol')) {
    content = "Create and fill out a ContextControl\n" + (await context_control(user_had));
  } else {
    content = "Not matched to any module, please re-enter!";
  }

  return content;
}

async function conv_persona_des(input_1) {
    const prompt_1 = "You are an excellent high school mathematics tutor, " +
        "but the math scores of your students are particularly poor. " +
        "Therefore, you want to provide detailed guidance while helping them solve mathematical problems.\n" +
        "What kind of persona does the above information create?\n" +
        "Please summarize the above information using more concise words." +
        "output:Persona{ An excellent high school mathematics tutor.}\n" +
        "Note:1)Only output the content in 'persona', do not output the content already in 'input_1'.\n" +
        "2)Output format: 'Persona{'+AI roles that meet the purpose+'}'\n" +
        "3)The output content must match the purpose of the input and cannot output sample content.\n"
    const information = input_1 + "\n"
        + "What kind of AI character does the above information create?\n" +
        "Please summarize the above information using more concise words.\n"
    const system_prompt = 'knowledge base:' + system_1 + '\nAnalysis process and example:' + prompt_1
    return await call_llm(system_prompt, information)
}


async function conv_audience_des(input_1) {
    const prompt_2 = "What is the audience of this character?\n" +
        "output:Audience{ high school students with poor math scores.}" +
        "Note:1)Only output the content in 'audience', do not output the content already in 'input_1'.\n" +
        "2)Output format: 'Audience:{'+AI audience that meet the purpose+'}'\n" +
        "3)The output content must match the purpose of the input and cannot output sample content.\n"
    const information = input_1 + "What is the audience of this character?\n" +
        "Note:Please summarize in more concise words.\n"
    const system_prompt = 'knowledge base:' + system_2 + '\nAnalysis process and example:' + prompt_2
    return call_llm(system_prompt, information)
}

// # con_ins 生成主要的子任务步骤,可以作为ins的name
async function conv_instruction(input_1) {
  const prompt_3 =
    system.technology +
    '\n' +
    "As a team member, your task is to fill out a form based on the completed form information that can achieve user goals. The entry in the form is the content contained in the Instructions in the knowledge base.\n" +
    "Here is an example:\n" +
    "Input:\n" +
    "completed forms:[\n    {\n      \"id\": 1,\n      \"annotationType\": \"Persona\",\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Description\",\n            \"content\": \"You are a creative NPC creator\"\n        }\n      ]\n    },\n    {\n      \"id\": 2,\n      \"annotationType\": \"Audience\",\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Description\",\n            \"content\": \"Children at age 6-12\"\n        }\n      ]\n    },\n    {\n      id: 3,\n      annotationType: \"Terminology\",\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Terms\",\n            \"content\": [\"weapons: sword, axe, mace, spear, bow, crossbow, carrot, balloon\"]\n        }\n      ]\n    },\n    {\n      \"id\": 4,\n      \"annotationType\": 'Instruction',\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Commands\",\n            \"content\": [\"wait for the user to enter NPC description\",\"create a NPC profile for an RPG game in JSON format based on the input NPC description\"]\n        },\n        {\n            \"sectionId\": \"S2\",\n            \"sectionType\": \"Rules\",\n            \"content\": [\"name, age, armor and items must be appropriate for the target audience\", \"armor must be in weapons\"]\n        },\n        {\n            \"sectionId\": \"S3\",\n            \"sectionType\": \"Format\",\n            content: \" description : <NPC description>,\\\\n            name : <NPC name>,\\\\n            age : <NPC age>,\\\\n            armor : <select one from weapons>,\\\\n            items : <three items appropriate for this NPC>,\"\n        }\n      ]\n    }\n]\n" +
    "goals:Added the function to automatically name NPCS\n" +
    "Output:Instruction{name:Automatically name NPCs;commands:automatically name the NPC based on their characteristics.comment:the NPC name should reflect their characteristics and be appropriate for the target audience.rules:NPC name occupies one line.format:'NPC name:\n'+content.example:\nInput:A teacher who helps college students solve problems.\nOutput:NPC name:University counselor.\n" +
    "(END OF EXAMPLE)\n" +
    "Output_format:Instruction{name: <instruction name>.commands: <command 1>;<command 2>;....comment: <comment 1>;<comment 2>.rules:<rule 1>;<rule 2>.format:<format>.example:<example 1>;<example 2>.}\n" +
    "Note:1)Only output the content in 'instruction', do not output the content already in 'input_1'.\n" +
    "2)The output must match the input topic , cannot output think steps.\n" +
    "3)The total output word count should not exceed 500 words.";

  const information =
    input_1 +
    "\n" +
    "What do you think it should do to achieve its goals?\n" +
    "Please provide step-by-step answers while keeping the responses as concise as possible, but logical.\n";

  const system_prompt = 'knowledge base:' + system_3 + '\nAnalysis process and example:' + prompt_3;
  const instr = await call_llm(system_prompt, information, {
    temperature_data: 0,
    maxtokens: 1024,
  });

  const prompt_6 =
    "name:The name of the instruction.An instruction has only one name.\n" +
    "commands:Directs each step of the process to achieve the goal.An instruction can have multiple commands\n" +
    "comments:Used to add annotations or descriptive comments to the instruction for this goal.\n.An instruction can have multiple comments" +
    "rules:A specific rule or condition used to describe or standardize the generation of text instructions.\n" +
    "format:Used to describe the output format of the instruction for this goal.An instruction has only one format.\n" +
    "example:To provide an example as a reference for this goal.An instruction can have multiple example\n";

  const prompt =
    "First, learn to remember the definition of 'name、commands、comment、rules、format、example' in the " +
    prompt_6 +
    "\nThen the input information is matched and classified with the following 6 modules, and if there is a module information, the module and its information are output; If not, the module name and related information are not output\n" +
    "Output_format is: name:XX\n.commands:1,XX;2,XX\n.comment:1,XX;2,XX;3,\n.rules:1,XX;2,XX\n.format:XX\n.example:XX\n" +
    "Note:1)Each module can have up to 2 pieces of information, and the total output word count should not exceed 300 words.\n";

  return await call_llm(prompt, instr);
}

async function context_control(input_1) {
  const prompt_4 =
    system.technology +
    '\n' +
    "As a team member, your task is to fill out a form based on the completed form information that can achieve user goals. The entry in the form is the content contained in the Contextcontrol in the knowledge base.\n" +
    "Here is a example:\n" +
    "Input:\n" +
    "completed forms:[\n    {\n      \"id\": 1,\n      \"annotationType\": \"Persona\",\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Description\",\n            \"content\": \"You are a creative NPC creator\"\n        }\n      ]\n    },\n    {\n      \"id\": 2,\n      \"annotationType\": \"Audience\",\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Description\",\n            \"content\": \"Children at age 6-12\"\n        }\n      ]\n    },\n    {\n      id: 3,\n      annotationType: \"Terminology\",\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Terms\",\n            \"content\": [\"weapons: sword, axe, mace, spear, bow, crossbow, carrot, balloon\"]\n        }\n      ]\n    },\n    {\n      \"id\": 4,\n      \"annotationType\": 'Contextcontrol',\n      \"section\": [\n        {\n            \"sectionId\": \"S1\",\n            \"sectionType\": \"Rules\",\n            \"content\": [\"1. Use clear and concise explanations, avoiding unnecessary jargon.\", \"2. Guide students through the problem-solving process step by step, emphasizing the logic and reasoning behind each step.\", \"3. Tailor your teaching strategies to cater to their individual needs and provide personalized assistance.\"]\n        }\n      ]\n    }\n]\n" +
    "goals:Consider the cultural sensitivity;\n" +
    "Output:Contextcontrol{commands:description Conduct thorough research to ensure accurate representation of different cultures and ethnicities in NPC profiles.rules:description Ensure that NPC profiles do not perpetuate stereotypes or present offensive representations of any culture or ethnicity.description:description Incorporate cultural elements, symbols, and traditions in NPC profiles that are respectful and meaningful within the context of the RPG game.description Awareness and consideration of cultural differences and the potential impact on individuals within a diverse community.}\n" +
    "(END OF EXAMPLE)\n" +
    "Output_format:Contextcontrol{commands: <command 1>;<command 2>;....rules:<rule 1>;<rule 2>.description:<description 1>;<description 2>.terms<term 1>;<term 2>}\n" +
    "Note:1)Only output the content in 'contextcontrol', do not output the content already in 'input_1'.\n" +
    "2)The output content must match the purpose of the input and cannot output sample content.\n";

  const information =
    input_1 +
    "\nWhat should it pay attention to when implementing the above steps?\n" +
    "Please summarize in more concise words.\n";

  const system_prompt = 'knowledge base:' + system_4 + '\nAnalysis process and example:' + prompt_4;
  const instr = await call_llm(system_prompt, information, { maxtokens: 1024 });

  const prompt_5 =
    "commands:Directs each step of the process to achieve the goal.An instruction can have multiple commands\n" +
    "rules:Used to describe the rules that need to be followed in the instruction.\n" +
    "description:A statement that specifically describes contextcontrol.An contextcontrol can have a desciption\n" +
    "terms:The technical terms involved in contextcontrol are listed and explained accordingly.An contextcontrol can have multiple terms\n";

  const prompt =
    "First, learn to remember the definition of 'commands、rules、description、terms' in the " +
    prompt_5 +
    ".Then the input information is matched and classified with the following 6 modules, and if there is a module information, the module and its information are output; If not, the module name and related information are not output\n" +
    "The output format is: description:XX\n.commands:1,XX;2,XX\n.rules:1,XX;2,XX\n.terms:1,XX;2,XX\n" +
    "Note:1)Each module can have up to 2 pieces of information, and the total output word count should not exceed 300 words.\n";

  return await call_llm(prompt, instr);
}

async function formAssit(inputMsg, form_data, cache, apiKey) {
  OpenAPIKey = apiKey;
  let sec_form_data = form_data.replace('section', 'Sub-section');
  let anno_form_data = sec_form_data.replace('annotationType', 'Section');
  let system_help = [
    'Now start knowledge-based Q&A ',
    'please input your question ',
    ' Now start operating method Q&A, please input your question ',
    ' Please input your requirements'
  ];
  let flag = cache;
  let context = '';

  if (cache === '0') {
    if (!isNaN(inputMsg)) {
      const option = parseInt(inputMsg);
      if (option >= 1 && option <= 3) {
        context = system_help[option - 1];
        flag = inputMsg;
      } else if (option === 4) {
        context = await reflection(anno_form_data);
        flag = inputMsg;
      } else {
        context = 'There is no such option!';
      }
    } else {
      context = 'This option is not used. Please enter the service serial number you want:';
    }
  } else {
    if (inputMsg === 'end') {
      context =
        'After this service ends, you can enter the service serial number to start a new service session.I can provide you with four services: \n1. Explanation and Q&A of Form Terms \n2. Recommendation of Common Use Cases \n3. Recommendation for filling in the form of requirement changes \n4. Check and reflect on the filling results  \nPlease enter the service number you want:';
      flag = '0';
    } else if (cache === '1') {
      context = await function_q_a(inputMsg);
    } else if (cache === '2') {
      context = await usage_q_a(inputMsg);
    } else if (cache === '3') {
      context = await recommend(anno_form_data, inputMsg);
    } else {
      context = await reflection(anno_form_data);
    }
  }
  return {"context": context, "flag": flag};
}

module.exports = { formAssit };
