const globalTeardown = () => {
  if (global.testClient) {
    global.testClient.close();
  }
  if (global.testServer) {
    global.testServer.close();
  }
};

// eslint-disable-next-line import/no-default-export
export default globalTeardown;
