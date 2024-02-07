require('dotenv').config()
const { OpenAI, openAIAPI} = require("openai")

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

async function completeChat(text){
    const completion = await openai.chat.completions.create({
        messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: text}],
        model: "gpt-4-turbo-preview",
    })
    
    response = completion.choices[0].message.content
    return response
}

async function generateImage(text){
    // const response = await openai.createImage({
    //     prompt: text,
    //     model: "dalle-e-3",
    // })

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: text
    })

    let image_url = response.data[0].url
    console.log(image_url)
    return image_url
}

generateImage('In a city called "Meme Town" a character called "Reddit" is known as the sherrif in that town. In there, He flys over in his rocket and watches over all his memes. Create this scenario where he is watching over "Pepe", "Bonk", "Shiba Inu". In the streets of the city, there should be a theater called "AMC" and a store called "GMESTOP"')

exports.completeChat = completeChat
exports.generateImage = generateImage