import {Telegraf, session} from 'telegraf'
import config from 'config'
import {message} from "telegraf/filters";
import {code} from "telegraf/format";
import {ogg} from './ogg.js'
import {openai} from "./openai.js";
import {ChatCompletionRequestMessage} from "openai";

const INITIAL_SESSION = {
    messages: []
}

const BOT = new Telegraf(config.get('TG_TOKEN'))

BOT.use(session())

BOT.command('new', async (context) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.session = INITIAL_SESSION
    await context.reply('Жду ваше сообщение')
})

BOT.command('start', async (context) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.session = INITIAL_SESSION
    await context.reply('Жду ваше сообщение')
})

BOT.on(message('voice'), async context => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.session ??= INITIAL_SESSION
    try {
        await context.reply(code("Принял! Обрабатываю..."))
        const link = await context.telegram.getFileLink(context.message.voice.file_id)
        const userId = String(context.message.from.id)


        const oggPath = await ogg.createMP3(link.href, userId) as string
        const mp3Path = await ogg.toMP3(oggPath, userId) as string

        const text = await openai.transcription(mp3Path)
        const messages: ChatCompletionRequestMessage[] = [{role: openai.roles.User, content: text as string}]
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        context.session.messages.push({role: openai.roles.User, content: text as string})
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const response = await openai.chat(context.session.messages)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        context.session.messages.push({role: openai.roles.Assistant, content: response!.content})

        await context.reply(response!.content)

    } catch (e) {
        console.log(e)
    }
})


BOT.on(message('text'), async context => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.session ??= INITIAL_SESSION
    try {
        await context.reply(code("Принял! Обрабатываю..."))
        // const link = await context.telegram.getFileLink(context.message.voice.file_id)
        // const userId = String(context.message.from.id)
        //
        //
        // const oggPath = await ogg.createMP3(link.href, userId) as string
        // const mp3Path = await ogg.toMP3(oggPath, userId) as string

        // const messages: ChatCompletionRequestMessage[] = [{role: openai.roles.User, content: text as string}]
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        context.session.messages.push({role: openai.roles.User, content: context.message.text})
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const response = await openai.chat(context.session.messages)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        context.session.messages.push({role: openai.roles.Assistant, content: response!.content})

        await context.reply(response!.content)

    } catch (e) {
        console.log(e)
    }
})





// BOT.command('start', async (ctx) => {
//     await ctx.reply(JSON.stringify(ctx.message, null, 2))
// })


BOT.launch()

process.once('SIGINT', () => BOT.stop('SIGINT'))
process.once('SIGTERM', () => BOT.stop('SIGTERM'))