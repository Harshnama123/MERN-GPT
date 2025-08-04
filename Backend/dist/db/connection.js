import { connect, disconnect } from 'mongoose';
export default async function connectToDatabase() {
    try {
        await connect(process.env.MONGODB_URL);
    }
    catch (error) {
        console.log(error);
        throw new Error("cannot connect to database");
    }
}
async function disconnectFromDatabase() {
    try {
        await disconnect();
    }
    catch (error) {
        console.log(error);
        throw new Error("cannot disconnect from database");
    }
}
export { connectToDatabase, disconnectFromDatabase };
//# sourceMappingURL=connection.js.map