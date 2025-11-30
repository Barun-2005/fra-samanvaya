console.log("Starting test");
try {
    const app = require('./src/app');
    console.log("App loaded");
} catch (e) {
    console.error("Error loading app:", e);
}
