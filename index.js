export default async function serializePropTypes(modulePathOrPaths) {
  const workerURL = new URL('./worker.js', import.meta.url).href;
  const worker = new Worker(workerURL);
  worker.postMessage(modulePathOrPaths);
  const promise = new Promise((resolve, reject) => {
    worker.onmessage = event => { resolve(event.data) }
  });
  const result = await promise;
  worker.terminate();
  return result;
}
