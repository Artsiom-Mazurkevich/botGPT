import * as http from "http";
import {createWriteStream} from 'fs'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import axios from "axios";
import Ffmpeg from "fluent-ffmpeg";
import * as installer from '@ffmpeg-installer/ffmpeg'
import {removeFile} from "./utils.js";


const __dirname = dirname(fileURLToPath(import.meta.url))


class OggConverter {
    constructor() {
        Ffmpeg.setFfmpegPath(installer.path)
    }


    async createMP3(url: string, filename: string) {

        // const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
        // const req = http.request({path: url, method: 'GET', hostname: '192.168.100.7'}, res => {
        //     const writeStream = createWriteStream(oggPath);
        //     res.pipe(writeStream);
        //     writeStream.on('finish', () => {
        //         console.log('Запись в файл завершена.');
        //     });
        // })
        // console.log(req)
        // req.on('error', function(err) {
        //     console.log(err);
        // });
        // req.end()


        try {
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
            const response = await axios({
                method: 'GET',
                url,
                responseType: 'stream'
            })
            return new Promise((resolve, reject) => {
                const stream = createWriteStream(oggPath)
                response.data.pipe(stream)
                stream.on('finish', () => resolve(oggPath))
            })

        } catch (e) {
            console.log(e)
        }


    }

    toMP3(oggPath: string, userId: string) {
        try {
            const outhputPath = resolve(dirname(oggPath), `${userId}.mp3`)

            return new Promise((resolve, reject) => {
                Ffmpeg(oggPath).inputOption('-t 30').output(outhputPath).on('end', () => {
                    removeFile(oggPath)
                    resolve(outhputPath)
                }).on('error', (err) => reject(err.message)).run()
            })

        } catch (e) {
            console.log(e)
        }
    }
}


export const ogg = new OggConverter()