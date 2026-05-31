import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_DB_URI;

if (!MONGO_URI) {
    console.error('MONGO_DB_URI not found in .env');
    process.exit(1);
}

async function run() {
    try {
        await mongoose.connect(MONGO_URI!);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db!.collection('events');

        const oldId = '6a0889ec1ad9502d532a2daa';
        const newId = '69ef05e00ee676cb3fbdb5e7';

        // 1. Find the old document
        const oldDoc = await collection.findOne({ _id: new mongoose.Types.ObjectId(oldId) });

        if (!oldDoc) {
            console.error(`Event with _id ${oldId} not found`);
            await mongoose.disconnect();
            return;
        }

        console.log('Found old document:', oldDoc.eventName);

        // 2. Clone and change _id
        const newDoc = { ...oldDoc, _id: new mongoose.Types.ObjectId(newId) };

        // 3. Insert new
        await collection.insertOne(newDoc);
        console.log(`Inserted new document with _id ${newId}`);

        // 4. Delete old
        await collection.deleteOne({ _id: new mongoose.Types.ObjectId(oldId) });
        console.log(`Deleted old document with _id ${oldId}`);

        console.log('Operation completed successfully');
    } catch (err) {
        console.error('Error during operation:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
