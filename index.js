import { spawn, Thread, Worker } from 'threads';

export default async function serializePropTypes(modulePathOrPaths) {
  const worker = await spawn(new Worker('./worker'));
  const result = await worker.serializePropTypes(modulePathOrPaths);
  await Thread.terminate(worker);
  return result;
}
