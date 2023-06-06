import {resolve} from "path";
import * as dotenv from "dotenv";



dotenv.config({ path: resolve(__dirname, "../config/config.env") });


interface ENV {
    TG_TOKEN: string | undefined;
    OPENAI_KEY: string | undefined;
}

interface Config {
    TG_TOKEN: string;
    OPENAI_KEY: string;
}


const getConfig = (): ENV => {
    return {
        TG_TOKEN: process.env.TG_TOKEN,
        OPENAI_KEY: process.env.OPENAI_KEY
    };
};

const config = getConfig()

export default config