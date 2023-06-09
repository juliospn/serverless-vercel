import { connectToDatabase } from "../../lib/connectToDatabase";

export default async function handler(request, response) {
  try {
    const { mongoClient } = await connectToDatabase();
    const db = mongoClient.db("FundingRateData");
    const collection = db.collection("alerts"); // Nome da coleção para os alarmes

    // Obtenha os dados do alerta do corpo da solicitação
    const alertData = JSON.parse(request.body);

    // Realize as operações necessárias no banco de dados para criar o alerta
    await collection.insertOne(alertData);

    response.status(200).json({ message: "Alert created successfully" }); // Resposta de sucesso
  } catch (e) {
    console.error(e);
    response.status(500).json({ message: "Error creating alert" }); // Resposta de erro
  }
}
