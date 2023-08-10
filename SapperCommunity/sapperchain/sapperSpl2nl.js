let system1 = `
Your task is to find the natural language counterpart in the semi-structured language.

Keywords = ['@persona', '@audience', '@terminology', '@context-control', '@instruction', '@command', '@comment', '@rule', '@desc'];

For natural language and semi-structured language in the input, perform the following steps:
1) First, the corresponding parts are found in natural language according to the semantics of semi-structured language;
2) Put the keyword in Keywords of the corresponding part of the semi-structured language in the natural language;

Input:
Semi-structured language: "";
Natural language: "";

respond form:
The part of a natural language that corresponds to the semantics of semi-structured language.

example1:

Semi-structured language:
@terminology {
    weapons = "sword, axe, mace, spear, bow, crossbow, carrot, balloon";
}


Natural language:
You are a creative NPC creator.
Your audience is children aged 6-12.
The weapons terminology includes sword, axe, mace, spear, bow, crossbow, carrot, and balloon.
Your task is to create an NPC profile for an RPG game in JSON format based on the input NPC description.
The NPC profile must follow certain rules.
The name, age, armor, and items must be appropriate for the target audience.
The armor must be selected from the list of weapons provided.
The NPC profile format requires the age to be a number and if no weapon is selected, an explanation must be given.
The NPC profile includes a description, name, age, armor (selected from the list of weapons), and three items appropriate for this NPC.

respond:
The weapons terminology includes sword, axe, mace, spear, bow, crossbow, carrot, and balloon.

example2:

Semi-structured language:
@persona {
    You are a creative NPC creator;
}


Natural language:
You are a creative NPC creator.
Your audience is children aged 6-12.
The weapons terminology includes sword, axe, mace, spear, bow, crossbow, carrot, and balloon.
Your task is to create an NPC profile for an RPG game in JSON format based on the input NPC description.
The NPC profile must follow certain rules.
The name, age, armor, and items must be appropriate for the target audience.
The armor must be selected from the list of weapons provided.
The NPC profile format requires the age to be a number and if no weapon is selected, an explanation must be given.
The NPC profile includes a description, name, age, armor (selected from the list of weapons), and three items appropriate for this NPC.

respond:
You are a creative NPC creator.
`
let system2 = `
Your task is to convert semi-structured language into natural language.

Keywords = ['@persona', '@audience', '@terminology', '@context-control', '@instruction', '@command', '@comment', '@rule'];

For semi-structured language in the input, perform the following steps:
1) Convert semi-structured language into natural language according to the Keywords;

Input:
Semi-structured language: "";

respond form:
'';
`

async function getResponseFormAPI(prompt){
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: "",
    });
    // ""
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      max_tokens: 1024,
      temperature: 0.3,
      model: "gpt-3.5-turbo",
      messages: prompt,
    });
    return(completion.data.choices[0].message.content);
}
async function LLM_correspondence2(system, nl, spl){
    const messages=[
        {"role": "system", "content": system},
        {"role": "user", "content": "Semi-structured language: \n" + spl + "\nNatural language: \n" + nl}
    ]
    return await getResponseFormAPI(messages);
}
// 没修改的spl一部分
// 没修改的nl一部分
async function correspondence(nl, spl) {
    return await LLM_correspondence2(system1, spl, nl)
}

async function LLM_transform(system, spl) {
    const messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": "Semi-structured language: \n" + spl}
    ]
    return await getResponseFormAPI(messages);
}
// # 修改后的spl一部分
// # 修改的nl一部分
async function transform(spl) {
    return LLM_transform(system2, spl);
}

async function LLM_replace(nl, a, b) {
    const messages = [
        {
            "role": "system",
            "content": "Please modify the content I give according to the task.\n\nThis is what I gave you:\n" + nl + "\n\nIn the above, replace " + a + " with " + b
        }
    ]
    return await getResponseFormAPI(messages);
}
// # a 修改前的nl一部分, b 修改后的nl一部分
// # 修改后的nl
async function replace(nl, a, b)
{
    return await LLM_replace(nl, a, b)
}

async function spl2nl(nl, oldspl, newspl)
{
    const oldnlp = await correspondence(nl, oldspl)
    console.log(oldnlp + '\n\n')
    const newnlp = await transform(newspl)
    console.log(newnlp + '\n\n')
    return await replace(nl, oldnlp, newnlp)
}

const nl = `
You are a math teacher.
You will be teaching to students in grades 1-6.
You will wait for students to type in math questions.
You will answers to math questions are based on the knowledge of students in grades 1-6.
`

const oldspl = `
@persona {
    You are a math teacher;
}
`

const newspl=`
@persona {
    You are a physics teacher;
}`

// spl2nl(nl, oldspl, newspl)
// .then((result) => {
// console.log(result);
// })
// .catch((error) => {
// console.error('Error:', error);
// });
