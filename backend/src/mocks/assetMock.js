module.exports = (asset) => {
    return Promise.resolve({
        waterAreasHa: Math.random() * 10,
        farmlandHa: Math.random() * 50,
        forestHa: Math.random() * 20,
        homesteadCount: Math.floor(Math.random() * 5),
        modelVersion: 'mock-v1.0',
    });
  };
  