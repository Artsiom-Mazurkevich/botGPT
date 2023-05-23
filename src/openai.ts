import {ChatCompletionRequestMessage, Configuration, OpenAIApi} from 'openai'
import config from "config";
import {createReadStream} from 'fs'
import {ChatCompletionRequestMessageRoleEnum} from "openai/api.js";

class OpenAI {
    roles: typeof ChatCompletionRequestMessageRoleEnum = {
        System: "system",
        User: "user",
        Assistant: "assistant"
    }
    private openai: OpenAIApi;
    constructor(apiKey: string) {
        const configuration = new Configuration({
            apiKey,
        });
        this.openai = new OpenAIApi(configuration);
    }

    async chat(messages: ChatCompletionRequestMessage[]) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            return response.data.choices[0].message
        } catch (e) {
            console.log(e)
        }
    }


    async transcription(filepath: string) {
        try {
            const response = await this.openai.createTranscription(
                createReadStream(filepath), 'whisper-1'
            )
            return response.data.text
        } catch (e) {
            console.log(e)
        }
    }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'))