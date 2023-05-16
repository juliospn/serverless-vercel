import { mongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let MongoClient; // this becomes our cached connection

if (!process.env.MONGODB_URI){
    throw new Error ("Please add your Mongo URI to .env.local");
}

export async function connectToDatabase() {
    try{
        if (mongoClient) {
            return { mongoClient };
        }
        mongoClient = await (new MongoClient(uri, options)).connect();
        console.log("Just Connected!");
        return { mongoClient };
    }   catch (e) {
        console.error(e);
    }
}