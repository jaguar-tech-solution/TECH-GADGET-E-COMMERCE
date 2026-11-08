import {Pool, neonConfig} from "@neondatabase/serverless";
import {PrismaNeon} from "@prisma/adapter-neon";
import ws from "ws";

import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '../generated/prisma/client.js';


//configuring Neon to use Node's wensocket module
neonConfig.webSocketConstructor = ws;

const createPrismaClient = () =>{
    const connectionString = process.env.DATABASE_URL
   
   // console.log(connectionString)
    if(!connectionString){
        throw new Error('DATABASE_URL environment variable is missing.')
        return;
    }

    //initialize the Neon serverless connection pool
    const pool = new Pool({connectionString});

    //initialize the Prisma Neon adapter
    const adapter = new PrismaNeon(pool);

    //creating PrismaClient instance backed by the Neon adapter
    return new PrismaClient({
        adapter,
        log:process.env.NODE_ENV == "development" ? ["query", "error", "warn"] : ["error"],
    });
};

//creating a rausable singleton client instance across application
const prisma = globalThis.prismaGlobal ||  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export {prisma}