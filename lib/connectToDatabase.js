import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let dbClient; // this becomes our cached connection

if (!process.env.MONGODB_URI){
    throw new Error ("Please add your Mongo URI to .env.local");
}

export async function connectToDatabase() {
    try{
        if (dbClient) {
            return { mongoClient: dbClient };
        }
        dbClient = await (new MongoClient(uri, options)).connect();
        console.log("Just Connected!");
        return { mongoClient: dbClient };
    }   catch (e) {
        console.error(e);
    }
}
