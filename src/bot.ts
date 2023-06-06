import {Telegraf, session, Context} from 'telegraf'
import config from 'config'
// import config from "./config.js";
import {message} from "telegraf/filters";
import { fileURLToPath } from 'url';
import {code} from "telegraf/format";
import {ogg} from './ogg.js'
import {openai} from "./openai.js";
import { config as dotenvConfig } from 'dotenv';
import { dirname, join } from 'path';


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
const TG_TOKEN = env.TG_TOKEN;




interface Ctx extends Context {
    session: { messages: Array<any> }
}


const INITIAL_SESSION = {
    messages: []
}

const BOT = new Telegraf<Ctx>(TG_TOKEN)
// const BOT = new Telegraf<Ctx>(config.get('TG_TOKEN'))
// const BOT = new Telegraf<Ctx>(config.TG_TOKEN || '')

BOT.use(session())

BOT.command('new', async (context) => {
    context.session = INITIAL_SESSION
    await context.reply('Жду ваше сообщение')
})

BOT.command('start', async (context) => {
    context.session = INITIAL_SESSION
    await context.reply('Жду ваше сообщение')
})

BOT.on(message('voice'), async context => {
    context.session ??= INITIAL_SESSION
    try {
        await context.reply(code("Принял! Обрабатываю..."))
        const link = await context.telegram.getFileLink(context.message.voice.file_id)
        const userId = String(context.message.from.id)


        const oggPath = await ogg.createMP3(link.href, userId) as string
        const mp3Path = await ogg.toMP3(oggPath, userId) as string

        const text = await openai.transcription(mp3Path)
        context.session.messages.push({role: openai.roles.User, content: text as string})
        const response = await openai.chat(context.session.messages)
        context.session.messages.push({role: openai.roles.Assistant, content: response!.content})
        await context.reply(response!.content)
    } catch (e) {
        if (e instanceof Error) {
            await context.reply(`❗${e.message}❗`)
            console.log(e.message)
        }
    }
})


BOT.on(message('text'), async context => {
    context.session ??= INITIAL_SESSION
    try {
        await context.reply(code("Принял! Обрабатываю..."))
        context.session.messages.push({role: openai.roles.User, content: context.message.text})
        const response = await openai.chat(context.session.messages)
        context.session.messages.push({role: openai.roles.Assistant, content: response!.content})
        await context.reply(response!.content)
    } catch (e) {
        if (e instanceof Error) {
            await context.reply(`❗${e.message}❗`)
            console.log(e.message)
        }
    }
})


// BOT.command('start', async (ctx) => {
//     await ctx.reply(JSON.stringify(ctx.message, null, 2))
// })


BOT.launch()

process.once('SIGINT', () => BOT.stop('SIGINT'))
process.once('SIGTERM', () => BOT.stop('SIGTERM'))