import {ChatCompletionRequestMessage, Configuration, OpenAIApi} from 'openai'
import config from "config"
// import config from "./config.js";
import {createReadStream} from 'fs'
import {ChatCompletionRequestMessageRoleEnum} from "openai/api.js"
import { config as dotenvConfig } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';


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
            if (e instanceof Error) {
                console.log(messages)
                console.log('Error in chat method: ',e.message)
            }
        }
    }


    async transcription(filepath: string) {
        try {
            const response = await this.openai.createTranscription(
                // @ts-ignore
                createReadStream(filepath), 'whisper-1'
            )
            return response.data.text
        } catch (e) {
            if (e instanceof Error) {
                console.log('Error in transcription method: ',e.message)
            }
        }
    }
}





// Получение пути к текущему модулю
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//
//
export interface EnvVariables {
    TG_TOKEN: string;
    OPENAI_KEY: string;
}

// Загрузка переменных окружения из файла `.env`
dotenvConfig({ path: join(__dirname, '..', '.env') });
// @ts-ignore
const env: EnvVariables = process.env as EnvVariables;
const OPENAI_KEY = env.OPENAI_KEY;








export const openai = new OpenAI(OPENAI_KEY)
// export const openai = new OpenAI(process.env.OPENAI_KEY || "")

// export const openai = new OpenAI(config.OPENAI_KEY || '')
// @ts-ignore
// const env: EnvVariables = process.env as EnvVariables;
// const OPENAI_KEY = env.OPENAI_KEY;
// export const openai = new OpenAI(OPENAI_KEY)