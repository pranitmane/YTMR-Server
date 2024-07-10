const os = require('os');
const networkInterfaces = os.networkInterfaces();

export default function getIPAddress() {
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const value of interfaces) {
      if (value.family === 'IPv4' && !value.internal) {
        return value.address;
      }
    }
  }
  return null;
}


